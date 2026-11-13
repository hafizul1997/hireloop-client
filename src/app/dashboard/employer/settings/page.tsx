import type { Metadata } from "next";
import { requireRole } from "@/lib/guards";
import { objectId, profiles, users } from "@/lib/db";
import { PageHeader } from "../../components/job-card";
import { ProfileSettings } from "../../components/profile-settings";

export const metadata: Metadata = {
  title: "Settings — HireLoop",
};

/** Employer settings — reads the live user + profile documents from MongoDB. */
export default async function EmployerSettingsPage() {
  const session = await requireRole("employer");
  const userId = objectId(session.user.id);
  const [user, profile] = await Promise.all([
    userId ? users.findOne({ _id: userId }) : null,
    profiles.findOne({ userId: session.user.id }),
  ]);

  if (!user) return null;

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Settings"
        subtitle="Manage your account details and professional profile."
      />
      <div className="mt-6">
        <ProfileSettings user={user} profile={profile} />
      </div>
    </div>
  );
}
