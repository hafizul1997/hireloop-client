"use server";

import { revalidatePath } from "next/cache";
import {
  activities,
  applications,
  APPLICATION_STATUSES,
  jobs,
  objectId,
  savedJobs,
  type ActivityKind,
  type ApplicationStatus,
  type Job,
} from "@/lib/db";
import { requireRole } from "@/lib/guards";
import { statusLabel } from "@/lib/format";

/**
 * All dashboard mutations. Every action re-checks the session role server
 * side (requireRole) and scopes writes to the caller's id, so a crafted
 * request can never touch another user's data.
 */

const DASHBOARD_PATHS = [
  "/dashboard",
  "/dashboard/jobs",
  "/dashboard/saved-jobs",
  "/dashboard/applications",
  "/dashboard/employer",
  "/dashboard/employer/jobs",
  "/dashboard/employer/applicants",
  "/dashboard/admin",
  "/dashboard/admin/jobs",
  "/dashboard/admin/users",
];

function refreshDashboard() {
  for (const path of DASHBOARD_PATHS) {
    revalidatePath(path);
  }
}

async function addActivity(
  userId: string,
  kind: ActivityKind,
  parts: { text: string; highlight?: boolean }[],
) {
  await activities.insertOne({ userId, kind, parts, createdAt: new Date() });
}

/** Drop undefined values so optional fields don't become nulls in Mongo. */
function withoutUndefined<T extends object>(doc: T): T {
  return Object.fromEntries(
    Object.entries(doc).filter(([, value]) => value !== undefined),
  ) as T;
}

// ---------------------------------------------------------------------------
// Seeker actions
// ---------------------------------------------------------------------------

export async function saveJob(jobId: string) {
  const session = await requireRole("employee");
  const id = objectId(jobId);
  if (!id) return;

  await savedJobs.updateOne(
    { userId: session.user.id, jobId: id },
    { $setOnInsert: { userId: session.user.id, jobId: id, createdAt: new Date() } },
    { upsert: true },
  );
  refreshDashboard();
}

export async function unsaveJob(jobId: string) {
  const session = await requireRole("employee");
  const id = objectId(jobId);
  if (!id) return;

  await savedJobs.deleteOne({ userId: session.user.id, jobId: id });
  refreshDashboard();
}

export async function applyToJob(jobId: string) {
  const session = await requireRole("employee");
  const id = objectId(jobId);
  if (!id) return;

  const job = await jobs.findOne({ _id: id, status: "open" });
  if (!job) return;

  const alreadyApplied = await applications.countDocuments({
    userId: session.user.id,
    jobId: id,
  });
  if (alreadyApplied > 0) return;

  const seekerName = session.user.name || session.user.email;

  await applications.insertOne({
    jobId: id,
    jobTitle: job.title,
    userId: session.user.id,
    seekerName,
    employerId: job.employerId,
    status: "submitted",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await addActivity(session.user.id, "status", [
    { text: "Application submitted for " },
    { text: job.title, highlight: true },
    { text: "." },
  ]);
  await addActivity(job.employerId, "applicant", [
    { text: "New applicant " },
    { text: seekerName, highlight: true },
    { text: " applied for " },
    { text: job.title, highlight: true },
    { text: "." },
  ]);

  refreshDashboard();
}

// ---------------------------------------------------------------------------
// Employer actions
// ---------------------------------------------------------------------------

type ParsedJobForm = {
  /** Job fields ready to insert/update (no employerId/status/createdAt). */
  fields: Omit<Job, "employerId" | "status" | "createdAt">;
  valid: boolean;
};

/** Shared parser for the sectioned job post editor form. */
function parseJobForm(formData: FormData): ParsedJobForm {
  const deadlineRaw = String(formData.get("deadline") ?? "").trim();
  const salaryMin = String(formData.get("salaryMin") ?? "").trim();
  const salaryMax = String(formData.get("salaryMax") ?? "").trim();
  const salaryFrequency = String(formData.get("salaryFrequency") ?? "").trim();

  const range =
    salaryMin && salaryMax ? `${salaryMin} – ${salaryMax}` : salaryMax || salaryMin;
  const salary = [range, salaryFrequency].filter(Boolean).join(" / ");

  return {
    fields: withoutUndefined({
      title: String(formData.get("title") ?? "").trim(),
      company: String(formData.get("company") ?? "").trim(),
      type: String(formData.get("employmentType") ?? "Full-time"),
      category: String(formData.get("category") ?? "").trim(),
      workMode: String(formData.get("workMode") ?? "Onsite"),
      location: String(formData.get("location") ?? "").trim(),
      industry: String(formData.get("industry") ?? "").trim(),
      deadline: deadlineRaw ? new Date(deadlineRaw) : undefined,
      salaryMin,
      salaryMax,
      salaryFrequency,
      responsibilities: String(formData.get("responsibilities") ?? "").trim(),
      qualifications: String(formData.get("qualifications") ?? "").trim(),
      remoteFriendly: formData.get("remoteFriendly") === "on",
      salary,
      description: "",
    }),
    valid: Boolean(String(formData.get("title") ?? "").trim() &&
      String(formData.get("company") ?? "").trim()),
  };
}

export async function postJob(formData: FormData) {
  const session = await requireRole("employer");
  const { fields, valid } = parseJobForm(formData);
  if (!valid) return;

  await jobs.insertOne({
    ...fields,
    employerId: session.user.id,
    status: "open",
    createdAt: new Date(),
  });

  await addActivity(session.user.id, "job", [
    { text: "Job post " },
    { text: fields.title, highlight: true },
    { text: " is now live." },
  ]);

  refreshDashboard();
}

export async function employerUpdateJob(formData: FormData) {
  const session = await requireRole("employer");

  const jobId = objectId(String(formData.get("jobId") ?? ""));
  const { fields, valid } = parseJobForm(formData);
  if (!jobId || !valid) return;

  // Ownership check — employers may only edit their own listings.
  await jobs.updateOne(
    { _id: jobId, employerId: session.user.id },
    { $set: fields },
  );

  refreshDashboard();
}

export async function toggleJobStatus(jobId: string) {
  const session = await requireRole("employer");
  const id = objectId(jobId);
  if (!id) return;

  const job = await jobs.findOne({ _id: id, employerId: session.user.id });
  if (!job) return;

  await jobs.updateOne(
    { _id: id },
    { $set: { status: job.status === "open" ? "closed" : "open" } },
  );
  refreshDashboard();
}

/** Employer: permanently remove one of their own listings plus its applications and saves. */
export async function employerDeleteJob(jobId: string) {
  const session = await requireRole("employer");

  const id = objectId(jobId);
  if (!id) return;

  // Ownership check — employers may only delete their own listings.
  const job = await jobs.findOne({ _id: id, employerId: session.user.id });
  if (!job) return;

  await applications.deleteMany({ jobId: id });
  await savedJobs.deleteMany({ jobId: id });
  await jobs.deleteOne({ _id: id });

  refreshDashboard();
}

export async function updateApplicationStatus(formData: FormData) {
  const session = await requireRole("employer");

  const id = objectId(String(formData.get("applicationId") ?? ""));
  const status = String(formData.get("status") ?? "") as ApplicationStatus;

  if (!id || !APPLICATION_STATUSES.includes(status)) return;

  // Ownership check — employers may only update applications to their jobs.
  const application = await applications.findOne({
    _id: id,
    employerId: session.user.id,
  });
  if (!application) return;

  await applications.updateOne(
    { _id: id },
    { $set: { status, updatedAt: new Date() } },
  );

  await addActivity(application.userId, "status", [
    { text: "Application for " },
    { text: application.jobTitle, highlight: true },
    { text: " updated to " },
    { text: statusLabel(status), highlight: true },
    { text: "." },
  ]);

  refreshDashboard();
}

// ---------------------------------------------------------------------------
// Admin actions
// ---------------------------------------------------------------------------

export async function adminUpdateJob(formData: FormData) {
  await requireRole("admin");

  const jobId = objectId(String(formData.get("jobId") ?? ""));
  const { fields, valid } = parseJobForm(formData);
  if (!jobId || !valid) return;

  await jobs.updateOne({ _id: jobId }, { $set: fields });

  refreshDashboard();
}

/** Admin: create a listing directly (owned by the admin account). */
export async function adminCreateJob(formData: FormData) {
  const session = await requireRole("admin");

  const { fields, valid } = parseJobForm(formData);
  if (!valid) return;

  await jobs.insertOne({
    ...fields,
    employerId: session.user.id,
    status: "open",
    createdAt: new Date(),
  });

  await addActivity(session.user.id, "job", [
    { text: "Job post " },
    { text: fields.title, highlight: true },
    { text: " is now live." },
  ]);

  refreshDashboard();
}

/** Admin: permanently remove a listing plus its applications and saves. */
export async function adminDeleteJob(jobId: string) {
  await requireRole("admin");

  const id = objectId(jobId);
  if (!id) return;

  await applications.deleteMany({ jobId: id });
  await savedJobs.deleteMany({ jobId: id });
  await jobs.deleteOne({ _id: id });

  refreshDashboard();
}

export async function adminCloseJob(jobId: string) {
  await requireRole("admin");
  const id = objectId(jobId);
  if (!id) return;

  await jobs.updateOne({ _id: id }, { $set: { status: "closed" } });
  refreshDashboard();
}
