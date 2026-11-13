import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Banknote, Building2, CalendarClock, MapPin } from "lucide-react";
import { requireRole } from "@/lib/guards";
import { timeAgo } from "@/lib/format";
import { applications, jobs, objectId } from "@/lib/db";
import { Crumb, PageHeader } from "../../components/job-card";
import { StatusBadge } from "../../components/status-badge";

export const metadata: Metadata = {
  title: "Application Details — HireLoop",
};

/** Seeker's single application — status, timeline and the job's details. */
export default async function ApplicationDetailsPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const session = await requireRole("employee");
  const { applicationId } = await params;

  // Ownership check — a crafted URL can never read someone else's application.
  const id = objectId(applicationId);
  const application = id
    ? await applications.findOne({ _id: id, userId: session.user.id })
    : null;
  if (!application) redirect("/dashboard/applications");

  const job = await jobs.findOne({ _id: application.jobId });

  const facts = [
    {
      icon: Building2,
      label: "Company",
      value: job?.company ?? "—",
    },
    {
      icon: MapPin,
      label: "Location",
      value: job ? [job.location, job.workMode].filter(Boolean).join(" · ") : "—",
    },
    {
      icon: CalendarClock,
      label: "Applied",
      value: timeAgo(application.createdAt),
    },
    {
      icon: CalendarClock,
      label: "Last Update",
      value: timeAgo(application.updatedAt),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl">
      <Crumb
        items={[
          { label: "My Applications", href: "/dashboard/applications" },
          { label: application.jobTitle },
        ]}
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <PageHeader title={application.jobTitle} subtitle="Application details and progress." />
        <StatusBadge status={application.status} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="rounded-2xl border border-white/5 bg-[#141414] p-5"
          >
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <fact.icon className="size-4" aria-hidden="true" />
              {fact.label}
            </div>
            <p className="mt-2 font-medium">{fact.value}</p>
          </div>
        ))}
      </div>

      {job ? (
        <div className="mt-8 space-y-4">
          {job.salary ? (
            <div className="flex items-center gap-2 rounded-2xl border border-white/5 bg-[#141414] p-5">
              <Banknote className="size-4 text-zinc-400" aria-hidden="true" />
              <span className="text-sm text-zinc-400">Salary:</span>
              <span className="font-medium">{job.salary}</span>
            </div>
          ) : null}

          {job.responsibilities ? (
            <section className="rounded-2xl border border-white/5 bg-[#141414] p-5">
              <h2 className="font-semibold">Responsibilities</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-zinc-400">
                {job.responsibilities}
              </p>
            </section>
          ) : null}

          {job.qualifications ? (
            <section className="rounded-2xl border border-white/5 bg-[#141414] p-5">
              <h2 className="font-semibold">Qualifications</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-zinc-400">
                {job.qualifications}
              </p>
            </section>
          ) : null}

          <Link
            href="/dashboard/jobs"
            className="inline-block rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
          >
            Browse More Jobs
          </Link>
        </div>
      ) : (
        <p className="mt-8 text-sm text-zinc-500">
          The original job post is no longer available.
        </p>
      )}
    </div>
  );
}
