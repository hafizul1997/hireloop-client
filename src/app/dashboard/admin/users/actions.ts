"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/guards";
import {
  accounts,
  activities,
  applications,
  jobs,
  objectId,
  savedJobs,
  sessions,
  users,
} from "@/lib/db";

/**
 * Admin user-management mutations. Every action re-checks the admin role,
 * and admin accounts (plus the caller themselves) can never be modified
 * from here.
 */

const ADMIN_PATHS = ["/dashboard/admin", "/dashboard/admin/users"];

function refreshAdmin() {
  for (const path of ADMIN_PATHS) {
    revalidatePath(path);
  }
}

/** Fetch the target user, or null when it must not be touched. */
async function moderatableUser(userId: string, callerId: string) {
  const id = objectId(userId);
  if (!id) return null;

  const target = await users.findOne({ _id: id });
  if (!target) return null;
  if (target.role === "admin") return null;
  if (userId === callerId) return null;

  return target;
}

/** Flip a user between the two self-serve roles (Seeker ↔ Recruiter). */
export async function updateUserRole(formData: FormData) {
  const session = await requireRole("admin");

  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!["employee", "employer"].includes(role)) return;

  const target = await moderatableUser(userId, session.user.id);
  if (!target) return;

  await users.updateOne(
    { _id: objectId(userId)! },
    { $set: { role, updatedAt: new Date() } },
  );
  refreshAdmin();
}

/** Suspend (revokes their sessions) or re-activate a user. */
export async function updateUserStatus(formData: FormData) {
  const session = await requireRole("admin");

  const userId = String(formData.get("userId") ?? "");
  const suspended = String(formData.get("suspended") ?? "") === "true";

  const target = await moderatableUser(userId, session.user.id);
  if (!target) return;

  await users.updateOne(
    { _id: objectId(userId)! },
    { $set: { status: suspended ? "suspended" : "active", updatedAt: new Date() } },
  );

  // Suspended users are signed out everywhere, right away.
  if (suspended) {
    await sessions.deleteMany({ userId });
  }
  refreshAdmin();
}

/** Permanently remove a user and everything they own on the platform. */
export async function deleteUser(formData: FormData) {
  const session = await requireRole("admin");

  const userId = String(formData.get("userId") ?? "");
  const target = await moderatableUser(userId, session.user.id);
  if (!target) return;

  await sessions.deleteMany({ userId });
  await accounts.deleteMany({ userId });
  await users.deleteOne({ _id: objectId(userId)! });

  // Clear the user's domain data so counts stay consistent.
  await jobs.deleteMany({ employerId: userId });
  await applications.deleteMany({ userId });
  await savedJobs.deleteMany({ userId });
  await activities.deleteMany({ userId });

  refreshAdmin();
}
