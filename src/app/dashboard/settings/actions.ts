"use server";

import { revalidatePath } from "next/cache";
import { activities, profiles, type ActivityKind } from "@/lib/db";
import { requireUser } from "@/lib/guards";

/**
 * Settings mutations shared by every role (seeker/employer/admin) — writes
 * are always scoped to the caller's id. Resume upload/download itself goes
 * through the /api/dashboard/resume route handler (files exceed the 1MB
 * server-action body cap).
 */

const SETTINGS_PATHS = [
  "/dashboard",
  "/dashboard/settings",
  "/dashboard/employer/settings",
  "/dashboard/admin/settings",
];

function refreshSettings() {
  for (const path of SETTINGS_PATHS) {
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

/** Save headline / bio / skills for the signed-in user (any role). */
export async function saveProfessionalDetails(formData: FormData) {
  const session = await requireUser();

  const headline = String(formData.get("headline") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const skills = String(formData.get("skills") ?? "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean)
    .slice(0, 15);

  const update = {
    userId: session.user.id,
    headline,
    bio,
    skills,
    updatedAt: new Date(),
  };

  await profiles.updateOne(
    { userId: session.user.id },
    { $set: update },
    { upsert: true },
  );

  await addActivity(session.user.id, "user", [
    { text: "Professional details " },
    { text: "updated", highlight: true },
    { text: "." },
  ]);

  refreshSettings();
}

/** Remove the signed-in user's uploaded resume. */
export async function removeResume() {
  const session = await requireUser();

  await profiles.updateOne(
    { userId: session.user.id },
    { $unset: { resume: "" }, $set: { updatedAt: new Date() } },
    { upsert: true },
  );

  refreshSettings();
}
