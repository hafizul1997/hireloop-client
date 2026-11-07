import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db("hireloopdb");
export const auth = betterAuth({
  //...
 baseURL: process.env.BETTER_AUTH_URL,
 emailAndPassword: { 
    enabled: true, 
  },
   socialProviders: {
        google: { // [!code highlight]
            clientId: process.env.GOOGLE_CLIENT_ID as string, // [!code highlight]
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, // [!code highlight]
        }, // [!code highlight]
    },
  database: mongodbAdapter(db, {
    client,
  }),
});