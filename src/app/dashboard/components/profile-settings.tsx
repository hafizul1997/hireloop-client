import type { WithId } from "mongodb";
import type { ProfileDoc, UserDoc } from "@/lib/db";
import { ProfileInformation } from "./settings/profile-information";
import { ResumeCard } from "./settings/resume-card";
import { ProfessionalDetails } from "./settings/professional-details";

/**
 * Shared settings page body for every role — the three-card layout
 * (Profile Information / Resume / Professional Details) driven entirely by
 * the signed-in user's live documents. Raw Mongo docs (ObjectId `_id`s) are
 * stripped down to plain values here so they can cross the RSC boundary.
 */
export function ProfileSettings({
  user,
  profile,
}: {
  user: WithId<UserDoc>;
  profile: WithId<ProfileDoc> | null;
}) {
  const resume = profile?.resume
    ? {
        fileName: profile.resume.fileName,
        fileSize: profile.resume.fileSize,
        uploadedAt: profile.resume.uploadedAt.toISOString(),
      }
    : null;

  return (
    <div className="grid w-full gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <ProfileInformation
          name={user.name}
          email={user.email}
          image={user.image ?? null}
        />
        <ProfessionalDetails
          headline={profile?.headline ?? ""}
          bio={profile?.bio ?? ""}
          skills={profile?.skills ?? []}
        />
      </div>
      <ResumeCard resume={resume} />
    </div>
  );
}
