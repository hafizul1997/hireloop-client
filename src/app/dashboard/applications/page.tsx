import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import { requireRole } from "@/lib/guards";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { applications, jobs } from "@/lib/db";
import { EmptyState } from "../components/job-card";
import { StatusBadge } from "../components/status-badge";

export const metadata: Metadata = {
  title: "My Applications — HireLoop",
};

const PAGE_SIZE = 10;

/** Finalized outcomes land in the "Archived" tab. */
const ARCHIVED_STATUSES = ["rejected", "hired"];

/** Seeker's applications — live stats, search, tabs, pagination and details. */
export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; view?: string; page?: string }>;
}) {
  const session = await requireRole("employee");
  const { q = "", view = "active", page = "1" } = await searchParams;

  const pageNumber = Math.max(1, parseInt(page, 10) || 1);

  const myApplications = await applications
    .find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .toArray();

  const jobIds = myApplications.map((doc) => doc.jobId);
  const jobDocs = jobIds.length ? await jobs.find({ _id: { $in: jobIds } }).toArray() : [];
  const jobMap = new Map(jobDocs.map((job) => [job._id.toString(), job]));

  // Live stats over every application, regardless of the current filter.
  const total = myApplications.length;
  const shortlisted = myApplications.filter((a) => a.status === "under-review").length;
  const interviews = myApplications.filter((a) => a.status === "interview").length;
  const successes = myApplications.filter(
    (a) => a.status === "offer" || a.status === "hired",
  ).length;
  const successRate = total === 0 ? 0 : Math.round((successes / total) * 100);

  const query = q.trim().toLowerCase();
  const isArchived = view === "archived";
  const filtered = myApplications.filter((application) => {
    const archived = ARCHIVED_STATUSES.includes(application.status);
    if (isArchived !== archived) return false;
    if (!query) return true;
    const company = jobMap.get(application.jobId.toString())?.company ?? "";
    return (
      application.jobTitle.toLowerCase().includes(query) ||
      company.toLowerCase().includes(query)
    );
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((pageNumber - 1) * PAGE_SIZE, pageNumber * PAGE_SIZE);
  const shownFrom = filtered.length === 0 ? 0 : (pageNumber - 1) * PAGE_SIZE + 1;
  const shownTo = Math.min(pageNumber * PAGE_SIZE, filtered.length);

  // Params helper for the tabs / pagination links.
  const pageHref = (overrides: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (isArchived) next.set("view", "archived");
    for (const [key, value] of Object.entries(overrides)) {
      if (value === undefined) next.delete(key);
      else next.set(key, value);
    }
    return `/dashboard/applications?${next.toString()}`;
  };

  const stats = [
    { label: "Total Applied", value: String(total), tone: "" },
    { label: "Shortlisted", value: String(shortlisted), tone: "text-amber-400" },
    { label: "Interviews", value: String(interviews), tone: "text-amber-400" },
    { label: "Success Rate", value: `${successRate}%`, tone: "text-emerald-400" },
  ];

  const tabHref = (target: "active" | "archived") =>
    pageHref({ view: target === "active" ? undefined : "archived", page: undefined });

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* Search toolbar */}
      <form action="/dashboard/applications" className="w-full max-w-sm">
        {isArchived ? <input type="hidden" name="view" value="archived" /> : null}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
            aria-hidden="true"
          />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search applications..."
            className="h-9 w-full rounded-lg border border-white/10 bg-[#141414] pl-9 pr-3 text-sm outline-none placeholder:text-zinc-500 focus:border-white/20"
          />
        </div>
      </form>

      {/* Header */}
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">My Applications</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Track your job applications and interview progress in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-white/5 p-1 text-xs font-medium">
            <Link
              href={tabHref("active")}
              className={cn(
                "rounded-md px-3 py-1.5 transition-colors",
                !isArchived ? "bg-[#141414] text-white" : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              Active
            </Link>
            <Link
              href={tabHref("archived")}
              className={cn(
                "rounded-md px-3 py-1.5 transition-colors",
                isArchived ? "bg-[#141414] text-white" : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              Archived
            </Link>
          </div>
          <a
            href="/api/dashboard/applications/export"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
          >
            <Download className="size-4" aria-hidden="true" />
            Export CSV
          </a>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/5 bg-[#141414] p-5"
          >
            <p className="text-sm text-zinc-400">{stat.label}</p>
            <p className={cn("mt-2 text-3xl font-semibold tracking-tight", stat.tone)}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Applications table */}
      {visible.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title={total === 0 ? "No applications yet" : "No applications match this filter"}
            description={
              total === 0
                ? "Apply to a job and it will show up here with live status updates."
                : "Try a different search or tab."
            }
          />
        </div>
      ) : (
        <section className="mt-6 rounded-2xl border border-white/5 bg-[#141414]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-wider text-zinc-500">
                  <th className="px-5 py-3 font-medium">Job Title</th>
                  <th className="px-5 py-3 font-medium">Company</th>
                  <th className="px-5 py-3 font-medium">Applied</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((application) => {
                  const applicationId = application._id.toString();
                  const job = jobMap.get(application.jobId.toString());

                  return (
                    <tr
                      key={applicationId}
                      className="border-b border-white/5 last:border-b-0 transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-medium">{application.jobTitle}</p>
                        {job ? (
                          <p className="text-[11px] text-zinc-500">
                            {job.type} · {job.location}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-5 py-3.5 text-zinc-400">
                        {job?.company ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 text-xs whitespace-nowrap text-zinc-500">
                        {timeAgo(application.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={application.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/dashboard/applications/${applicationId}`}
                          className="text-xs font-medium text-zinc-300 transition-colors hover:text-white"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer: count + pagination */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 px-5 py-3.5">
            <p className="text-xs text-zinc-500">
              Showing {shownFrom}-{shownTo} of {filtered.length} application
              {filtered.length === 1 ? "" : "s"}
            </p>
            {pageCount > 1 ? (
              <div className="flex items-center gap-1.5">
                {pageNumber > 1 ? (
                  <Link
                    href={pageHref({ page: String(pageNumber - 1) })}
                    aria-label="Previous page"
                    className="flex size-8 items-center justify-center rounded-md border border-white/10 text-zinc-400 transition-colors hover:text-white"
                  >
                    <ChevronLeft className="size-4" aria-hidden="true" />
                  </Link>
                ) : null}
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((n) => (
                  <Link
                    key={n}
                    href={pageHref({ page: String(n) })}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-md text-xs font-medium transition-colors",
                      n === pageNumber
                        ? "bg-white text-black"
                        : "border border-white/10 text-zinc-400 hover:text-white",
                    )}
                  >
                    {n}
                  </Link>
                ))}
                {pageNumber < pageCount ? (
                  <Link
                    href={pageHref({ page: String(pageNumber + 1) })}
                    aria-label="Next page"
                    className="flex size-8 items-center justify-center rounded-md border border-white/10 text-zinc-400 transition-colors hover:text-white"
                  >
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      )}
    </div>
  );
}
