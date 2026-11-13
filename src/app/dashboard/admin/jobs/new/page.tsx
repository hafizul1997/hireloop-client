import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/guards";
import { adminCreateJob } from "../../../actions";
import { BTN_SECONDARY, Crumb, PageHeader } from "../../../components/job-card";
import { JobPostForm } from "../../../components/job-post-form";

export const metadata: Metadata = {
  title: "Create Job — HireLoop",
};

/** Admin: create a listing with the sectioned editor. */
export default async function AdminNewJobPage() {
  await requireRole("admin");

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Crumb
        items={[
          { label: "Manage Jobs", href: "/dashboard/admin/jobs" },
          { label: "Create New Job" },
        ]}
      />

      <div className="mt-2 flex items-start justify-between gap-4">
        <PageHeader
          title="Post a New Job"
          subtitle="Publish a listing on behalf of the platform — it becomes visible to job seekers once posted."
        />
        <Link href="/dashboard/admin/jobs" className={`${BTN_SECONDARY} mt-1 shrink-0`}>
          Back to All
        </Link>
      </div>

      <div className="mt-6">
        <JobPostForm action={adminCreateJob} submitLabel="Create Job" />
      </div>
    </div>
  );
}
