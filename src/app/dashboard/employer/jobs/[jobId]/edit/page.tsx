import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/guards";
import { timeAgo } from "@/lib/format";
import { jobs, objectId } from "@/lib/db";
import { employerUpdateJob } from "../../../../actions";
import { Crumb, PageHeader } from "../../../../components/job-card";
import { JobPostForm } from "../../../../components/job-post-form";

export const metadata: Metadata = {
  title: "Update Job Post — HireLoop",
};

/** Employer: edit one of their own job posts (ownership-checked). */
export default async function EditJobPage({
  params,
}: PageProps<"/dashboard/employer/jobs/[jobId]/edit">) {
  const session = await requireRole("employer");
  const { jobId } = await params;

  const id = objectId(jobId);
  const job = id
    ? await jobs.findOne({ _id: id, employerId: session.user.id })
    : null;

  if (!job) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Crumb
        items={[
          { label: "Manage Jobs", href: "/dashboard/employer/jobs" },
          { label: "Job Listings & Postings", href: "/dashboard/employer/jobs" },
          { label: "Update Job Post" },
        ]}
      />

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          title="Update Job Post"
          subtitle="Review the current listing, make changes, and update requirements for this listing."
        />
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">
          Created {timeAgo(job.createdAt)}
        </span>
      </div>

      <div className="mt-6">
        <JobPostForm action={employerUpdateJob} job={job} submitLabel="Update Job" />
      </div>
    </div>
  );
}
