import { MongoClient, ObjectId } from "mongodb";

/**
 * Shared MongoDB client — import from here everywhere; never open new
 * clients per call. The connection is opened lazily on first query.
 */
export const client = new MongoClient(process.env.MONGODB_URI as string);
/** Same database the hireloop-server Express backend reads ("hireloop"). */
export const db = client.db("hireloop");

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export type ApplicationStatus =
  | "submitted"
  | "under-review"
  | "interview"
  | "offer"
  | "hired"
  | "rejected";

export type JobStatus = "open" | "closed";

/** Icon key for activity feed entries (mapped to icons in the UI layer). */
export type ActivityKind =
  | "status"
  | "alert"
  | "message"
  | "applicant"
  | "job"
  | "interview"
  | "user";

export type UserDoc = {
  name: string;
  email: string;
  role?: string;
  /** "suspended" blocks sign-in (admin-managed, see auth additionalFields). */
  status?: "active" | "suspended";
  /** Profile photo URL (set by Google sign-in). */
  image?: string;
  createdAt: Date;
};

export type Job = {
  employerId: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  status: JobStatus;
  createdAt: Date;
  // Editor fields (post/update form)
  category?: string;
  workMode?: string;
  industry?: string;
  deadline?: Date;
  salaryMin?: string;
  salaryMax?: string;
  salaryFrequency?: string;
  responsibilities?: string;
  qualifications?: string;
  remoteFriendly?: boolean;
};

export type Application = {
  jobId: ObjectId;
  jobTitle: string;
  userId: string;
  seekerName: string;
  employerId: string;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type SavedJob = {
  userId: string;
  jobId: ObjectId;
  createdAt: Date;
};

export type ActivityDoc = {
  userId: string;
  kind: ActivityKind;
  parts: { text: string; highlight?: boolean }[];
  createdAt: Date;
};

export type TransactionStatus = "success" | "pending" | "failed";

/**
 * Platform billing ledger shown on the admin overview. Demo data until a
 * real payment provider is wired up (same approach as the static plan cards).
 */
export type TransactionDoc = {
  email: string;
  company: string;
  plan: string;
  txnId: string;
  amount: number;
  status: TransactionStatus;
  createdAt: Date;
};

/** Resume file stored inline (base64) — PDF/DOC/DOCX up to 2MB. */
export type ResumeDoc = {
  fileName: string;
  fileSize: number;
  contentType: string;
  data: string;
  uploadedAt: Date;
};

/**
 * Per-user professional profile (any role) — the editable part of the
 * settings page that Better Auth's user collection doesn't own.
 */
export type ProfileDoc = {
  userId: string;
  headline?: string;
  bio?: string;
  skills?: string[];
  resume?: ResumeDoc;
  updatedAt: Date;
};

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

/** Better Auth manages the "user" collection — read-only from app code. */
export const users = db.collection<UserDoc>("user");
export const jobs = db.collection<Job>("jobs");export const applications = db.collection<Application>("applications");
export const savedJobs = db.collection<SavedJob>("saved_jobs");
export const activities = db.collection<ActivityDoc>("activities");
export const transactions = db.collection<TransactionDoc>("transactions");
export const profiles = db.collection<ProfileDoc>("profiles");

// Better Auth–managed collections, touched only by admin moderation actions.
export const accounts = db.collection("account");
export const sessions = db.collection("session");

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "submitted",
  "under-review",
  "interview",
  "offer",
  "hired",
  "rejected",
];

/**
 * Better Auth's mongo adapter stores documents with ObjectId `_id`s and
 * exposes them as string `id`s — convert between the two with this helper.
 * Returns null when the id is not a valid ObjectId.
 */
export function objectId(id: string): ObjectId | null {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}
