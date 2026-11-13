import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/guards";
import { jobs, objectId } from "@/lib/db";
import { adminUpdateJob } from "../../../../actions";
import { Crumb, PageHeader } from "../../../../components/job-card";
import { JobPostForm } from "../../../../components/job-post-form";

export const metadata: Metadata = {
  title: "Update Job Post — HireLoop",
};

/** Admin: edit any job post on the platform. */
export default async function AdminEditJobPage({
  params,
}: PageProps<"/dashboard/admin/jobs/[jobId]/edit">) {
  await requireRole("admin");
  const { jobId } = await params;

  const id = objectId(jobId);
  const job = id ? await jobs.findOne({ _id: id }) : null;

  if (!job) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Crumb
        items={[
          { label: "Job posts", href: "/dashboard/admin/jobs" },
          { label: job.title },
          { label: "Update Job Post" },
        ]}
      />
      <div className="mt-2">
        <PageHeader
          title="Update Job Post"
          subtitle="Modify job information, compensation ranges, and candidate requirements for this listing."
        />
      </div>

      <div className="mt-6">
        <JobPostForm action={adminUpdateJob} job={job} submitLabel="Update Job" />
      </div>
    </div>
  );
}
