import type { Metadata } from "next";
import { requireRole } from "@/lib/guards";
import { applications, jobs, savedJobs } from "@/lib/db";
import { applyToJob, saveJob } from "../actions";
import { JobCard, PageHeader, EmptyState, BTN_PRIMARY, BTN_SECONDARY, BTN_DONE } from "../components/job-card";

export const metadata: Metadata = {
  title: "Browse Jobs — HireLoop",
};

/** Seeker job board — every open job on the platform, with save + apply. */
export default async function JobsPage() {
  const session = await requireRole("employee");

  const [openJobs, savedDocs, appliedDocs] = await Promise.all([
    jobs.find({ status: "open" }).sort({ createdAt: -1 }).limit(50).toArray(),
    savedJobs.find({ userId: session.user.id }).toArray(),
    applications.find({ userId: session.user.id }).toArray(),
  ]);

  const savedIds = new Set(savedDocs.map((doc) => doc.jobId.toString()));
  const appliedIds = new Set(appliedDocs.map((doc) => doc.jobId.toString()));

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Browse Jobs"
        subtitle="Open roles posted by employers on HireLoop."
      />

      {openJobs.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No jobs posted yet"
            description="Check back soon — employers are posting new roles every day."
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {openJobs.map((job) => {
            const jobId = job._id.toString();
            const isSaved = savedIds.has(jobId);
            const isApplied = appliedIds.has(jobId);

            return (
              <JobCard
                key={jobId}
                job={job}
                footer={
                  <>
                    {isSaved ? (
                      <span className={BTN_DONE}>Saved ✓</span>
                    ) : (
                      <form action={saveJob.bind(null, jobId)}>
                        <button type="submit" className={BTN_SECONDARY}>
                          Save
                        </button>
                      </form>
                    )}

                    {isApplied ? (
                      <span className={BTN_DONE}>Applied ✓</span>
                    ) : (
                      <form action={applyToJob.bind(null, jobId)}>
                        <button type="submit" className={BTN_PRIMARY}>
                          Apply
                        </button>
                      </form>
                    )}
                  </>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
