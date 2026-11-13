import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/guards";
import { postJob } from "../../../actions";
import { BTN_SECONDARY, Crumb, PageHeader } from "../../../components/job-card";
import { JobPostForm } from "../../../components/job-post-form";

export const metadata: Metadata = {
  title: "Post a New Job — HireLoop",
};

/** Employer: create a new job post with the sectioned editor. */
export default async function NewJobPage() {
  await requireRole("employer");

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Crumb
        items={[
          { label: "Manage Jobs", href: "/dashboard/employer/jobs" },
          { label: "Create New Job" },
        ]}
      />

      <div className="mt-2 flex items-start justify-between gap-4">
        <PageHeader
          title="Post a New Job"
          subtitle="Provide the basic details for the new job — it becomes visible to job seekers once posted."
        />
        <Link href="/dashboard/employer/jobs" className={`${BTN_SECONDARY} mt-1 shrink-0`}>
          Back to All
        </Link>
      </div>

      <div className="mt-6">
        <JobPostForm action={postJob} submitLabel="Post Job" />
      </div>
    </div>
  );
}
