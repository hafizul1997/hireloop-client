import type { Metadata } from "next";
import { requireRole } from "@/lib/guards";
import { timeAgo, statusLabel } from "@/lib/format";
import { APPLICATION_STATUSES, applications } from "@/lib/db";
import { updateApplicationStatus } from "../../actions";
import { PageHeader, EmptyState, BTN_PRIMARY } from "../../components/job-card";
import { StatusBadge } from "../../components/status-badge";

export const metadata: Metadata = {
  title: "Applicants — HireLoop",
};

const selectClass =
  "h-8 rounded-lg border border-white/10 bg-white/5 px-2 text-sm text-white outline-none";

/** Employer applicant pipeline — move candidates through hiring stages. */
export default async function ApplicantsPage() {
  const session = await requireRole("employer");

  const myApplicants = await applications
    .find({ employerId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Applicants"
        subtitle="Review candidates and update their status — they see it live."
      />

      {myApplicants.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No applicants yet"
            description="Applicants appear here as soon as someone applies to your jobs."
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {myApplicants.map((application) => (
            <div
              key={application._id.toString()}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-[#141414] p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {application.seekerName}{" "}
                  <span className="text-zinc-500">· {application.jobTitle}</span>
                </p>
                <p className="text-xs text-zinc-500">
                  Applied {timeAgo(application.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={application.status} />
                <form action={updateApplicationStatus} className="flex items-center gap-2">
                  <input
                    type="hidden"
                    name="applicationId"
                    value={application._id.toString()}
                  />
                  <select
                    name="status"
                    defaultValue={application.status}
                    className={selectClass}
                    aria-label="Application status"
                  >
                    {APPLICATION_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {statusLabel(status)}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className={BTN_PRIMARY}>
                    Update
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
