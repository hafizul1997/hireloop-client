/**
 * One-time migration: copies the Better Auth collections from the old
 * `hireloopdb` database to `hireloop` (the database the app now uses).
 * Existing documents in `hireloop` are never overwritten — only missing
 * ones are copied, so it is safe to run more than once.
 *
 * Usage: node scripts/migrate-db.mjs
 */
import { readFileSync } from "node:fs";
import { MongoClient } from "mongodb";

// Parse ../.env without needing the dotenv package.
const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((line) => line.includes("=") && !line.trim().startsWith("#"))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
    }),
);

if (!env.MONGODB_URI) {
  console.error("MONGODB_URI is missing from .env");
  process.exit(1);
}

const client = new MongoClient(env.MONGODB_URI);
await client.connect();

const from = client.db("hireloopdb");
const to = client.db("hireloop");

const collections = await from.listCollections().toArray();

if (collections.length === 0) {
  console.log("hireloopdb has no collections — nothing to migrate.");
}

for (const { name } of collections) {
  const docs = await from.collection(name).find({}).toArray();
  let copied = 0;

  for (const doc of docs) {
    const exists = await to.collection(name).findOne({ _id: doc._id });
    if (!exists) {
      await to.collection(name).insertOne(doc);
      copied += 1;
    }
  }

  console.log(`${name}: copied ${copied} of ${docs.length} document(s)`);
}

const users = await to.collection("user").countDocuments();
console.log(`Done — hireloop.user now has ${users} user(s).`);

await client.close();
