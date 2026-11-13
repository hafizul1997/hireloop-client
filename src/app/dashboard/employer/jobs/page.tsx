import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireRole } from "@/lib/guards";
import { formatDate, timeAgo } from "@/lib/format";
import { applications, jobs } from "@/lib/db";
import { Crumb } from "../../components/job-card";
import {
  JobPostsTable,
  type JobPostRow,
} from "../../components/job-posts-table";

export const metadata: Metadata = {
  title: "Manage Job Posts — HireLoop",
};

/**
 * Employer job manager — "Manage Job Posts" table. Live MongoDB queries:
 * the employer's listings plus applicant counts per job.
 */
export default async function EmployerJobsPage() {
  const session = await requireRole("employer");
  const employerId = session.user.id;

  const [myJobs, applicantCounts] = await Promise.all([
    jobs.find({ employerId }).sort({ createdAt: -1 }).limit(50).toArray(),
    applications
      .aggregate<{ _id: unknown; count: number }>([
        { $match: { employerId } },
        { $group: { _id: "$jobId", count: { $sum: 1 } } },
      ])
      .toArray(),
  ]);

  const countByJob = new Map(
    applicantCounts.map((entry) => [entry._id?.toString(), entry.count]),
  );

  const rows: JobPostRow[] = myJobs.map((job) => ({
    id: job._id.toString(),
    title: job.title,
    category: job.category ?? "Other",
    company: job.company,
    location: job.workMode ? `${job.workMode} · ${job.location || "—"}` : job.location,
    type: job.type,
    salary: job.salary,
    applicants: countByJob.get(job._id.toString()) ?? 0,
    status: job.status,
    deadline: job.deadline ? formatDate(job.deadline) : "—",
    posted: `Posted ${timeAgo(job.createdAt)}`,
  }));

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Crumb
        items={[
          { label: "Manage Jobs" },
          { label: "Job Listings & Postings" },
        ]}
      />

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">Manage Job Posts</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Review live listings, monitor applications, and update job details
            across your organization.
          </p>
        </div>
        <Link
          href="/dashboard/employer/jobs/new"
          className="flex items-center gap-1.5 rounded-lg bg-[#5b6cf5] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#4c5ce0]"
        >
          <Plus className="size-4" aria-hidden="true" />
          New Job Post
        </Link>
      </div>

      <div className="mt-6">
        <JobPostsTable rows={rows} />
      </div>
    </div>
  );
}
