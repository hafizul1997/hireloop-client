import type { Metadata } from "next";
import Link from "next/link";
import {
  Eye,
  Mail,
  Plus,
  Search,
  Timer,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { requireRole } from "@/lib/guards";
import { cn } from "@/lib/utils";
import { applications, jobs } from "@/lib/db";
import { adminDeleteJob } from "../../actions";
import { BTN_PRIMARY, EmptyState } from "../../components/job-card";
import { StatusBadge } from "../../components/status-badge";
import { CategoryFilter, StatusFilter } from "./components/job-filters";
import { ConfirmSubmit } from "../../components/confirm-submit";

export const metadata: Metadata = {
  title: "Manage Jobs — HireLoop",
};

/** Escape user input before using it inside a $regex. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const fmt = new Intl.NumberFormat("en-US");

/** Growth footnote helper — shared shape with the stat cards below. */
function deltaFootnote(
  current: number,
  previous: number,
  label: string,
): { text: string; tone: string } {
  if (previous === 0) {
    return current > 0
      ? { text: "new activity", tone: "text-emerald-400" }
      : { text: "no activity yet", tone: "text-zinc-500" };
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  return {
    text: `${pct >= 0 ? "+" : ""}${pct}% ${label}`,
    tone: pct >= 0 ? "text-emerald-400" : "text-red-400",
  };
}

/** Admin job moderation — every listing with filters, tabs and live stats. */
export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; status?: string }>;
}) {
  await requireRole("admin");
  const { q = "", cat = "", status = "" } = await searchParams;

  // Search across title / company / category; status and category filter exactly.
  const query = q.trim();
  const baseFilter: Record<string, unknown> = {};
  if (query) {
    const rx = { $regex: escapeRegExp(query), $options: "i" };
    baseFilter.$or = [{ title: rx }, { company: rx }, { category: rx }];
  }
  if (cat) baseFilter.category = cat;

  // Tab counts respect the search/category filters but ignore the status filter.
  const tabFilter = { ...baseFilter };
  if (status === "open" || status === "closed") baseFilter.status = status;

  const last30 = new Date();
  last30.setDate(last30.getDate() - 30);
  const last60 = new Date();
  last60.setDate(last60.getDate() - 60);

  const [
    allJobs,
    openCount,
    closedCount,
    categories,
    openJobIds,
    appsTotal,
    apps30,
    appsPrev,
    hiredAgg,
  ] = await Promise.all([
    jobs.find(baseFilter).sort({ createdAt: -1 }).limit(100).toArray(),
    jobs.countDocuments({ ...tabFilter, status: "open" }),
    jobs.countDocuments({ ...tabFilter, status: "closed" }),
    jobs.distinct("category", { category: { $ne: "" } }),
    jobs.find({ status: "open" }, { projection: { _id: 1 } }).toArray(),
    applications.countDocuments({}),
    applications.countDocuments({ createdAt: { $gte: last30 } }),
    applications.countDocuments({ createdAt: { $gte: last60, $lt: last30 } }),
    applications
      .aggregate<{ _id: null; avgDays: number }>([
        { $match: { status: "hired" } },
        {
          $project: {
            days: {
              $divide: [
                { $subtract: ["$updatedAt", "$createdAt"] },
                86_400_000,
              ],
            },
          },
        },
        { $group: { _id: null, avgDays: { $avg: "$days" } } },
      ])
      .toArray(),
  ]);

  // % of open listings that received at least one application.
  const openIds = openJobIds.map((job) => job._id);
  const openWithApps = openIds.length
    ? (await applications.distinct("jobId", { jobId: { $in: openIds } })).length
    : 0;
  const engagementPct = openIds.length
    ? Math.round((openWithApps / openIds.length) * 100)
    : null;

  const avgDays = hiredAgg[0]?.avgDays;
  const categoriesSorted = categories
    .filter((category): category is string => Boolean(category))
    .sort();

  const stats = [
    {
      icon: TrendingUp,
      label: "Engagement Rate",
      value: engagementPct === null ? "—" : `${engagementPct}%`,
      footnote: `${openWithApps} of ${openIds.length} open roles have applicants`,
      tone: engagementPct === null ? "text-zinc-500" : engagementPct >= 50 ? "text-emerald-400" : "text-amber-400",
    },
    {
      icon: Timer,
      label: "Avg. Time to Fill",
      value: avgDays ? `${Math.round(avgDays)} Days` : "—",
      footnote: avgDays ? "from application to hire" : "no hired applications yet",
      tone: "text-zinc-500",
    },
    {
      icon: Mail,
      label: "Total Applications",
      value: fmt.format(appsTotal),
      ...deltaFootnote(apps30, appsPrev, "vs last month"),
    },
  ];

  // Tab links keep the search/category filters; clicking the active tab clears it.
  const tabHref = (target: string) => {
    const next = new URLSearchParams({ q, cat });
    if (status !== target) next.set("status", target);
    return `/dashboard/admin/jobs?${next.toString()}`;
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* Search toolbar */}
      <form action="/dashboard/admin/jobs" className="w-full max-w-sm">
        {cat ? <input type="hidden" name="cat" value={cat} /> : null}
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
            aria-hidden="true"
          />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search jobs, companies..."
            className="h-9 w-full rounded-lg border border-white/10 bg-[#141414] pl-9 pr-3 text-sm outline-none placeholder:text-zinc-500 focus:border-white/20"
          />
        </div>
      </form>

      {/* Header */}
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">Manage Jobs</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Overview of active listings and historical job posts across the platform.
          </p>
        </div>
        <Link href="/dashboard/admin/jobs/new" className={BTN_PRIMARY}>
          <span className="inline-flex items-center gap-1.5">
            <Plus className="size-4" aria-hidden="true" />
            Create Job
          </span>
        </Link>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <StatusFilter value={status} />
        <CategoryFilter value={cat} categories={categoriesSorted} />
        <div className="ml-auto flex rounded-lg bg-white/5 p-1 text-xs font-medium">
          <Link
            href={tabHref("open")}
            className={cn(
              "rounded-md px-3 py-1.5 transition-colors",
              status === "open" ? "bg-[#141414] text-white" : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            Active ({fmt.format(openCount)})
          </Link>
          <Link
            href={tabHref("closed")}
            className={cn(
              "rounded-md px-3 py-1.5 transition-colors",
              status === "closed" ? "bg-[#141414] text-white" : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            Closed ({fmt.format(closedCount)})
          </Link>
        </div>
      </div>

      {/* Jobs table */}
      {allJobs.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No job posts found"
            description="Try a different search, category or status filter."
          />
        </div>
      ) : (
        <section className="mt-4 rounded-2xl border border-white/5 bg-[#141414]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-wider text-zinc-500">
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Company</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Date Posted</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allJobs.map((job) => {
                  const jobId = job._id.toString();

                  return (
                    <tr
                      key={jobId}
                      className="border-b border-white/5 last:border-b-0 transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-3.5">
                        <p className="max-w-[220px] truncate font-medium">{job.title}</p>
                        <p className="font-mono text-[11px] text-zinc-500">
                          Ref: {jobId.slice(0, 8).toUpperCase()}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white/10 text-xs font-semibold text-zinc-300">
                            {(job.company || "?").charAt(0).toUpperCase()}
                          </span>
                          <span className="max-w-[160px] truncate">{job.company}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {job.category ? (
                          <span className="inline-block rounded-md bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
                            {job.category}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-zinc-400">{job.type}</td>
                      <td className="px-5 py-3.5 text-xs whitespace-nowrap text-zinc-500">
                        {dateFmt.format(job.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-4 text-zinc-400">
                          <Link
                            href={`/dashboard/admin/jobs/${jobId}/edit`}
                            aria-label={`View or edit ${job.title}`}
                            title="View / Edit"
                            className="transition-colors hover:text-white"
                          >
                            <Eye className="size-4" aria-hidden="true" />
                          </Link>
                          <form action={adminDeleteJob.bind(null, jobId)}>
                            <ConfirmSubmit
                              className="transition-colors hover:text-red-400"
                              message={`Delete "${job.title}"? This also removes its applications and saves.`}
                            >
                              <Trash2 className="size-4" aria-hidden="true" />
                            </ConfirmSubmit>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Bottom stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/5 bg-[#141414] p-5"
          >
            <div className="flex items-center gap-2">
              <stat.icon className="size-4 text-zinc-400" aria-hidden="true" />
              <p className="text-sm text-zinc-400">{stat.label}</p>
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{stat.value}</p>
            <p className={cn("mt-2 text-xs", stat.tone)}>{stat.footnote}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
