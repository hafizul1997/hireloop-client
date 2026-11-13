/**
 * Seeds the `hireloop` database with demo data for the dashboards:
 *
 *  - one demo employer (credential sign-in, see DEMO_* below)
 *  - seven job listings (five open, two closed) owned by that employer
 *  - applications (varied statuses) for every existing employee user
 *  - saved jobs for the employees
 *  - activity feed entries for both the seeker and employer sides
 *
 * Safe to run more than once — existing docs are never duplicated:
 * users match on email, jobs on title+company+employer, applications and
 * saved jobs on user+job. Activities are only written alongside newly
 * created docs.
 *
 * Usage: node scripts/seed-db.mjs
 */
import { readFileSync } from "node:fs";
import { randomBytes, scrypt } from "node:crypto";
import { MongoClient, ObjectId } from "mongodb";

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

// Demo employer credentials — override the password via SEED_DEMO_PASSWORD.
const DEMO_NAME = "Ayesha Rahman";
const DEMO_EMAIL = "employer@hireloop.dev";
const DEMO_PASSWORD = env.SEED_DEMO_PASSWORD || "Demo1234!";
const DEMO_COMPANY = "NovaPay Technologies";

// Matches @better-auth/utils password.node.mjs exactly:
// `${salt}:${scrypt(NFKC(password), salt, 64, { N: 16384, r: 16, p: 1 }).toString("hex")}`
// where salt is 16 random bytes hex-encoded, kept as the raw salt string.
function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16).toString("hex");
    scrypt(
      password.normalize("NFKC"),
      salt,
      64,
      { N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2 },
      (err, key) => {
        if (err) reject(err);
        else resolve(`${salt}:${key.toString("hex")}`);
      },
    );
  });
}

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const daysAhead = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

const client = new MongoClient(env.MONGODB_URI);
await client.connect();

const db = client.db("hireloop");
const users = db.collection("user");
const accounts = db.collection("account");
const jobs = db.collection("jobs");
const applications = db.collection("applications");
const savedJobs = db.collection("saved_jobs");
const activities = db.collection("activities");
const transactions = db.collection("transactions");

// ---------------------------------------------------------------------------
// Demo employer (skipped when the email already exists)
// ---------------------------------------------------------------------------

let employer = await users.findOne({ email: DEMO_EMAIL });
if (!employer) {
  const _id = new ObjectId();
  const now = new Date();
  await users.insertOne({
    _id,
    name: DEMO_NAME,
    email: DEMO_EMAIL,
    emailVerified: false,
    createdAt: now,
    updatedAt: now,
    role: "employer",
  });
  await accounts.insertOne({
    _id: new ObjectId(),
    accountId: _id.toString(),
    providerId: "credential",
    userId: _id.toString(),
    password: await hashPassword(DEMO_PASSWORD),
    createdAt: now,
    updatedAt: now,
  });
  employer = { _id };
  console.log(`user: created employer ${DEMO_EMAIL}`);
} else {
  console.log(`user: employer ${DEMO_EMAIL} already exists`);
}

const employerId = employer._id.toString();

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

const JOB_SEEDS = [
  {
    title: "Senior Frontend Engineer",
    type: "Full-time",
    category: "Engineering",
    workMode: "Remote",
    location: "Remote",
    industry: "Fintech",
    salaryMin: "90,000",
    salaryMax: "120,000",
    salaryFrequency: "year",
    remoteFriendly: true,
    deadline: daysAhead(21),
    age: 1,
    status: "open",
    responsibilities:
      "Own the customer-facing dashboard built with Next.js and TypeScript.\nDesign component APIs that scale across the product surface.\nPartner with design to ship a polished, accessible experience.\nMentor mid-level engineers through code review and pairing.",
    qualifications:
      "5+ years building production React applications.\nDeep knowledge of TypeScript, Next.js App Router and modern CSS.\nExperience with design systems and Tailwind CSS.\nStrong written communication for a fully remote team.",
  },
  {
    title: "Backend Engineer (Node.js)",
    type: "Full-time",
    category: "Engineering",
    workMode: "Hybrid",
    location: "Dhaka, Bangladesh",
    industry: "Fintech",
    salaryMin: "70,000",
    salaryMax: "95,000",
    salaryFrequency: "year",
    remoteFriendly: false,
    deadline: daysAhead(14),
    age: 3,
    status: "open",
    responsibilities:
      "Build and operate REST services on Node.js and MongoDB.\nOwn data models, migrations and query performance.\nHarden auth, rate limiting and audit trails.\nOn-call rotation with a small, supportive team.",
    qualifications:
      "3+ years with Node.js in production.\nSolid MongoDB data-modelling and indexing experience.\nComfortable with authentication flows (session/JWT based).\nBonus: exposure to Express or Fastify at scale.",
  },
  {
    title: "Product Designer (UI/UX)",
    type: "Full-time",
    category: "Design",
    workMode: "Remote",
    location: "Remote",
    industry: "SaaS",
    salaryMin: "60,000",
    salaryMax: "85,000",
    salaryFrequency: "year",
    remoteFriendly: true,
    deadline: daysAhead(30),
    age: 4,
    status: "open",
    responsibilities:
      "Own end-to-end design for the job-seeker experience.\nRun discovery interviews and turn findings into flows.\nMaintain the design system in close sync with engineering.\nPrototype quickly and validate with real users.",
    qualifications:
      "Portfolio with shipped product work.\nFluency in Figma and modern design-system practice.\nExperience designing data-heavy dashboards.\nBonus: motion design or front-end literacy.",
  },
  {
    title: "Data Analyst",
    type: "Full-time",
    category: "Data",
    workMode: "Onsite",
    location: "Dhaka, Bangladesh",
    industry: "HR Tech",
    salaryMin: "45,000",
    salaryMax: "60,000",
    salaryFrequency: "year",
    remoteFriendly: false,
    deadline: daysAhead(10),
    age: 5,
    status: "open",
    responsibilities:
      "Build the reporting layer for hiring funnels and job performance.\nWrite aggregation pipelines and maintain dashboards.\nPartner with product on experiment design and readouts.\nKeep metrics definitions consistent across teams.",
    qualifications:
      "2+ years in analytics or BI.\nAdvanced SQL plus working MongoDB aggregation knowledge.\nExperience with a BI tool (Metabase, Tableau or similar).\nClear storytelling with data.",
  },
  {
    title: "DevOps Engineer",
    type: "Contract",
    category: "Engineering",
    workMode: "Remote",
    location: "Remote",
    industry: "Fintech",
    salaryMin: "80,000",
    salaryMax: "110,000",
    salaryFrequency: "year",
    remoteFriendly: true,
    deadline: daysAhead(28),
    age: 6,
    status: "open",
    responsibilities:
      "Harden CI/CD pipelines for a Next.js + Node monolith.\nOwn observability: logs, traces and actionable alerts.\nManage MongoDB Atlas backups, scaling and cost.\nImprove zero-downtime deploys and rollback safety.",
    qualifications:
      "4+ years running production infrastructure.\nDocker, Terraform and a major cloud provider.\nStrong Linux and networking fundamentals.\nBonus: Atlas or other managed-DB operations experience.",
  },
  {
    title: "Customer Support Specialist",
    type: "Part-time",
    category: "Support",
    workMode: "Onsite",
    location: "Dhaka, Bangladesh",
    industry: "HR Tech",
    salaryMin: "25,000",
    salaryMax: "32,000",
    salaryFrequency: "year",
    remoteFriendly: false,
    deadline: daysAhead(7),
    age: 8,
    status: "closed",
    responsibilities:
      "Resolve candidate and employer issues across chat and email.\nDocument recurring problems and flag product gaps.\nHelp maintain the help-center content.",
    qualifications:
      "1+ year in customer support.\nExcellent written English.\nPatient, empathetic communication style.",
  },
  {
    title: "QA Automation Engineer",
    type: "Full-time",
    category: "Engineering",
    workMode: "Hybrid",
    location: "Dhaka, Bangladesh",
    industry: "Fintech",
    salaryMin: "55,000",
    salaryMax: "75,000",
    salaryFrequency: "year",
    remoteFriendly: false,
    deadline: daysAhead(18),
    age: 10,
    status: "closed",
    responsibilities:
      "Build Playwright end-to-end coverage for critical flows.\nTriage regressions and own the release checklist.\nWork with engineers to keep flakiness near zero.",
    qualifications:
      "3+ years in QA automation.\nPlaywright or Cypress expertise.\nComfortable reading TypeScript and API contracts.",
  },
];

const seededJobIds = {};

for (const seed of JOB_SEEDS) {
  const createdAt = daysAgo(seed.age);
  const doc = {
    employerId,
    title: seed.title,
    company: DEMO_COMPANY,
    location: seed.location,
    type: seed.type,
    salary: `${seed.salaryMin} – ${seed.salaryMax} / ${seed.salaryFrequency}`,
    status: seed.status,
    createdAt,
    category: seed.category,
    workMode: seed.workMode,
    industry: seed.industry,
    deadline: seed.deadline,
    salaryMin: seed.salaryMin,
    salaryMax: seed.salaryMax,
    salaryFrequency: seed.salaryFrequency,
    responsibilities: seed.responsibilities,
    qualifications: seed.qualifications,
    remoteFriendly: seed.remoteFriendly,
    description: "",
  };

  const existing = await jobs.findOne({
    title: seed.title,
    company: DEMO_COMPANY,
    employerId,
  });
  if (existing) {
    seededJobIds[seed.title] = existing._id;
    console.log(`jobs: ${seed.title} already exists`);
    continue;
  }

  const { insertedId } = await jobs.insertOne(doc);
  seededJobIds[seed.title] = insertedId;

  await activities.insertOne({
    userId: employerId,
    kind: "job",
    parts: [
      { text: "Job post " },
      { text: seed.title, highlight: true },
      { text: " is now live." },
    ],
    createdAt,
  });
  console.log(`jobs: created ${seed.title}`);
}

// ---------------------------------------------------------------------------
// Applications + saved jobs for every existing employee
// ---------------------------------------------------------------------------

const employees = await users
  .find({ role: { $in: ["employee", null, undefined] } })
  .toArray();

const OPEN_JOBS = JOB_SEEDS.filter((job) => job.status === "open");
const APPLICATION_STATUS_CYCLE = [
  "interview",
  "submitted",
  "under-review",
  "offer",
  "rejected",
];

let employeeIndex = 0;

for (const employee of employees) {
  const userId = employee._id.toString();
  const seekerName = employee.name || employee.email;
  const appliedTitles = [];
  const savedTitles = [];

  // Each employee applies to three jobs with different statuses.
  for (let i = 0; i < 3; i += 1) {
    const seed = OPEN_JOBS[(employeeIndex * 2 + i) % OPEN_JOBS.length];
    const jobId = seededJobIds[seed.title];
    const status = APPLICATION_STATUS_CYCLE[(employeeIndex + i) % APPLICATION_STATUS_CYCLE.length];
    const createdAt = daysAgo(seed.age + 1 - i);

    const already = await applications.countDocuments({ userId, jobId });
    if (already > 0) {
      console.log(`applications: ${employee.email} → ${seed.title} already exists`);
    } else {
      await applications.insertOne({
        jobId,
        jobTitle: seed.title,
        userId,
        seekerName,
        employerId,
        status,
        createdAt,
        updatedAt: createdAt,
      });
      appliedTitles.push({ seed, status, createdAt });
      console.log(`applications: ${employee.email} → ${seed.title} (${status})`);
    }

    // Seeker-side activity for the application event.
    const seekerActivity = await activities.countDocuments({
      userId,
      "parts.text": seed.title,
      kind: "status",
    });
    if (seekerActivity === 0) {
      await activities.insertOne({
        userId,
        kind: "status",
        parts: [
          { text: "Application submitted for " },
          { text: seed.title, highlight: true },
          { text: "." },
        ],
        createdAt,
      });
    }
  }

  // And saves one extra job they have not applied to (the three applied
  // positions are the same slots used by the application loop above).
  for (const seed of OPEN_JOBS) {
    const appliedSlot = [0, 1, 2].some(
      (i) => OPEN_JOBS[(employeeIndex * 2 + i) % OPEN_JOBS.length] === seed,
    );
    if (appliedSlot) continue;
    const jobId = seededJobIds[seed.title];
    const already = await savedJobs.countDocuments({ userId, jobId });
    if (already > 0) continue;

    await savedJobs.insertOne({
      userId,
      jobId,
      createdAt: daysAgo(seed.age),
    });
    savedTitles.push(seed.title);
    console.log(`saved_jobs: ${employee.email} saved ${seed.title}`);
  }

  employeeIndex += 1;
}

// ---------------------------------------------------------------------------
// Employer-side activity feed for every new applicant
// ---------------------------------------------------------------------------

const newApplications = await applications
  .find({ employerId })
  .sort({ createdAt: 1 })
  .toArray();

for (const application of newApplications) {
  const already = await activities.countDocuments({
    userId: employerId,
    kind: "applicant",
    "parts.text": application.seekerName,
  });
  if (already > 0) continue;

  await activities.insertOne({
    userId: employerId,
    kind: "applicant",
    parts: [
      { text: "New applicant " },
      { text: application.seekerName, highlight: true },
      { text: " applied for " },
      { text: application.jobTitle, highlight: true },
      { text: "." },
    ],
    createdAt: application.createdAt,
  });
}

// ---------------------------------------------------------------------------
// Subscription transactions (demo billing ledger for the admin overview)
// ---------------------------------------------------------------------------

const TRANSACTION_SEEDS = [
  { txnId: "ATH-992341", email: "marcus.g@techcorp.io", company: "TechCorp Inc", plan: "Enterprise Monthly", amount: 1299, status: "success", age: 1 },
  { txnId: "ATH-982135", email: "sara.lopez@creativestudio.com", company: "Creative Studio", plan: "Professional Annual", amount: 499, status: "success", age: 2 },
  { txnId: "ATH-774129", email: "j.dev@freelance.org", company: "Freelance", plan: "Starter Monthly", amount: 49, status: "pending", age: 3 },
  { txnId: "ATH-522814", email: "admin@meteorlabs.net", company: "Meteor Labs", plan: "Enterprise Monthly", amount: 1299, status: "failed", age: 4 },
  { txnId: "ATH-512907", email: "priya.n@northwind.io", company: "Northwind Labs", plan: "Professional Monthly", amount: 99, status: "success", age: 6 },
  { txnId: "ATH-498812", email: "okafor@zenpay.co", company: "ZenPay", plan: "Enterprise Annual", amount: 2999, status: "success", age: 9 },
];

for (const seed of TRANSACTION_SEEDS) {
  const exists = await transactions.countDocuments({ txnId: seed.txnId });
  if (exists > 0) {
    console.log(`transactions: ${seed.txnId} already exists`);
    continue;
  }

  await transactions.insertOne({
    txnId: seed.txnId,
    email: seed.email,
    company: seed.company,
    plan: seed.plan,
    amount: seed.amount,
    status: seed.status,
    createdAt: daysAgo(seed.age),
  });
  console.log(`transactions: created ${seed.txnId}`);
}

// ---------------------------------------------------------------------------
// Seeker billing history (transactions tied to the real employee accounts)
// ---------------------------------------------------------------------------

const SEEKER_TXN_SEEDS = [
  { txnId: "HLP-743372-HL", plan: "Professional Monthly", amount: 29, status: "success", age: 30 },
  { txnId: "HLP-773220-HL", plan: "Professional Monthly", amount: 29, status: "success", age: 60 },
  { txnId: "HLP-331055-HL", plan: "Professional Monthly", amount: 29, status: "success", age: 90 },
  { txnId: "HLP-221399-HL", plan: "Starter Monthly", amount: 12, status: "success", age: 120 },
];

const seekerEmail = employees[0]?.email;
if (seekerEmail) {
  for (const seed of SEEKER_TXN_SEEDS) {
    const exists = await transactions.countDocuments({ txnId: seed.txnId });
    if (exists > 0) {
      console.log(`transactions: ${seed.txnId} already exists`);
      continue;
    }

    await transactions.insertOne({
      txnId: seed.txnId,
      email: seekerEmail,
      company: DEMO_COMPANY,
      plan: seed.plan,
      amount: seed.amount,
      status: seed.status,
      createdAt: daysAgo(seed.age),
    });
    console.log(`transactions: created ${seed.txnId} for ${seekerEmail}`);
  }
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

const [jobCount, applicationCount, savedCount, userCount] = await Promise.all([
  jobs.countDocuments({}),
  applications.countDocuments({}),
  savedJobs.countDocuments({}),
  users.countDocuments({}),
]);

console.log(
  `\nDone — hireloop now has ${userCount} user(s), ${jobCount} job(s), ` +
    `${applicationCount} application(s), ${savedCount} saved job(s), ` +
    `${await transactions.countDocuments({})} transaction(s).`,
);
console.log(
  `\nDemo employer sign-in:\n  email:    ${DEMO_EMAIL}\n  password: ${DEMO_PASSWORD}\n` +
    "(set SEED_DEMO_PASSWORD before running to choose your own)",
);

await client.close();
