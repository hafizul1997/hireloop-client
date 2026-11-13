import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  Banknote,
  Bookmark,
  Briefcase,
  Clock,
  Code2,
  Headphones,
  MapPin,
  Megaphone,
  PenTool,
  Search,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { WithId } from "mongodb";
import { requireRole } from "@/lib/guards";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { applications, jobs, savedJobs, type Job } from "@/lib/db";
import { applyToJob, unsaveJob } from "../actions";
import { EmptyState, BTN_PRIMARY } from "../components/job-card";
import { SortSelect } from "./components/sort-select";

export const metadata: Metadata = {
  title: "Saved Jobs — HireLoop",
};

const PAGE_SIZE = 8;
const DAY = 86_400_000;

/** Icon tile per job category. */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Engineering: Code2,
  Design: PenTool,
  Data: BarChart3,
  Support: Headphones,
  Marketing: Megaphone,
};

type SavedRow = { savedAt: Date; job: WithId<Job> };

/** "Closing in 3 days" / "Closed" label for the right column. */
function deadlineLabel(job: Job, now: Date): { text: string; tone: string } | null {
  if (job.status !== "open") return { text: "Closed", tone: "text-red-400" };
  if (!job.deadline) return null;

  const days = Math.ceil((job.deadline.getTime() - now.getTime()) / DAY);
  if (days <= 0) return { text: "Closed", tone: "text-red-400" };
  if (days === 1) return { text: "Closing today", tone: "text-amber-400" };
  if (days <= 7) return { text: `Closing in ${days} days`, tone: "text-amber-400" };
  return null;
}

/** Seeker's bookmarked jobs — search, category pills, sorting and quick apply. */
export default async function SavedJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; sort?: string; page?: string }>;
}) {
  const session = await requireRole("employee");
  const userId = session.user.id;
  const { q = "", cat = "", sort = "saved", page = "1" } = await searchParams;

  const now = new Date();
  const pageNumber = Math.max(1, parseInt(page, 10) || 1);

  // One pass: saved bookmarks + their jobs + the user's applications.
  const savedDocs = await savedJobs.find({ userId }).sort({ createdAt: -1 }).toArray();
  const jobIds = savedDocs.map((doc) => doc.jobId);

  const [jobDocs, appliedDocs] = await Promise.all([
    jobIds.length ? jobs.find({ _id: { $in: jobIds } }).toArray() : [],
    applications.find({ userId }, { projection: { jobId: 1 } }).toArray(),
  ]);

  const jobMap = new Map(jobDocs.map((job) => [job._id.toString(), job]));
  const appliedIds = new Set(appliedDocs.map((doc) => doc.jobId.toString()));

  // Join the two sides, dropping bookmarks whose job was deleted.
  const entries: SavedRow[] = savedDocs
    .map((doc) => {
      const job = jobMap.get(doc.jobId.toString());
      return job ? { savedAt: doc.createdAt, job } : null;
    })
    .filter((row): row is SavedRow => row !== null);

  const totalSaved = savedDocs.length;
  const closingSoon = entries.filter(
    ({ job }) => deadlineLabel(job, now)?.tone === "text-amber-400",
  ).length;

  // Category pills with counts, from the unfiltered list.
  const categoryCounts = new Map<string, number>();
  for (const { job } of entries) {
    if (job.category) {
      categoryCounts.set(job.category, (categoryCounts.get(job.category) ?? 0) + 1);
    }
  }
  const categories = [...categoryCounts.keys()].sort();

  // Search (title / company / category) + category filter.
  const query = q.trim().toLowerCase();
  const filtered = entries.filter(({ job }) => {
    if (cat && job.category !== cat) return false;
    if (!query) return true;
    return [job.title, job.company, job.category]
      .filter(Boolean)
      .some((field) => field!.toLowerCase().includes(query));
  });

  // Sort: default recently saved; "deadline" puts closing jobs first.
  filtered.sort((a, b) => {
    if (sort === "oldest") return a.savedAt.getTime() - b.savedAt.getTime();
    if (sort === "deadline") {
      const aDeadline = a.job.deadline?.getTime() ?? Number.POSITIVE_INFINITY;
      const bDeadline = b.job.deadline?.getTime() ?? Number.POSITIVE_INFINITY;
      return aDeadline - bDeadline;
    }
    return b.savedAt.getTime() - a.savedAt.getTime();
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((pageNumber - 1) * PAGE_SIZE, pageNumber * PAGE_SIZE);

  // Params helper for the pills / load-more links.
  const pageHref = (overrides: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (sort !== "saved") next.set("sort", sort);
    if (cat) next.set("cat", cat);
    for (const [key, value] of Object.entries(overrides)) {
      if (value === undefined) next.delete(key);
      else next.set(key, value);
    }
    return `/dashboard/saved-jobs?${next.toString()}`;
  };

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* Search toolbar */}
      <form action="/dashboard/saved-jobs" className="w-full max-w-sm">
        {cat ? <input type="hidden" name="cat" value={cat} /> : null}
        {sort !== "saved" ? <input type="hidden" name="sort" value={sort} /> : null}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
            aria-hidden="true"
          />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search jobs, companies, or skills..."
            className="h-9 w-full rounded-lg border border-white/10 bg-[#141414] pl-9 pr-3 text-sm outline-none placeholder:text-zinc-500 focus:border-white/20"
          />
        </div>
      </form>

      {/* Header + stat tiles */}
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Saved Jobs</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage and track your bookmarked opportunities.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#141414] px-4 py-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-white/5 text-zinc-300">
              <Bookmark className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs text-zinc-500">Total Saved</p>
              <p className="text-lg font-semibold">{totalSaved}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#141414] px-4 py-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400">
              <Clock className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs text-zinc-500">Closing Soon</p>
              <p className="text-lg font-semibold">{closingSoon}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category pills + sort */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Link
            href={pageHref({ cat: undefined })}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              !cat
                ? "border border-white/20 bg-white/10 text-white"
                : "border border-white/5 text-zinc-500 hover:text-zinc-300",
            )}
          >
            All Saved ({entries.length})
          </Link>
          {categories.map((category) => (
            <Link
              key={category}
              href={pageHref({ cat: category })}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                cat === category
                  ? "border border-white/20 bg-white/10 text-white"
                  : "border border-white/5 text-zinc-500 hover:text-zinc-300",
              )}
            >
              {category} ({categoryCounts.get(category)})
            </Link>
          ))}
        </div>
        <SortSelect value={sort} />
      </div>

      {/* Saved job rows */}
      {visible.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title={entries.length === 0 ? "Nothing saved yet" : "No saved jobs match this filter"}
            description={
              entries.length === 0
                ? "Browse jobs and hit Save to keep track of the roles you like."
                : "Try a different search or category."
            }
          />
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {visible.map(({ savedAt, job }) => {
            const jobId = job._id.toString();
            const isApplied = appliedIds.has(jobId);
            const isClosed = job.status !== "open";
            const deadline = deadlineLabel(job, now);
            const Icon = (job.category && CATEGORY_ICONS[job.category]) || Briefcase;

            return (
              <div
                key={jobId}
                className={cn(
                  "rounded-2xl border border-white/5 bg-[#141414] p-5",
                  isClosed && "opacity-60",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-zinc-300">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <h3 className="font-semibold">{job.title}</h3>
                      {job.company ? (
                        <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                          {job.company}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.location ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-white/5 px-2.5 py-1 text-xs text-zinc-400">
                          <MapPin className="size-3" aria-hidden="true" />
                          {job.location}
                          {job.workMode ? `, ${job.workMode}` : ""}
                        </span>
                      ) : null}
                      {job.salary ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-white/5 px-2.5 py-1 text-xs text-zinc-400">
                          <Banknote className="size-3" aria-hidden="true" />
                          {job.salary}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <p className="text-xs text-zinc-500">Saved {timeAgo(savedAt)}</p>
                      {deadline ? (
                        <p className={cn("mt-1 text-xs font-medium", deadline.tone)}>
                          {deadline.text}
                        </p>
                      ) : null}
                    </div>

                    {/* Bookmark toggle */}
                    <form action={unsaveJob.bind(null, jobId)}>
                      <button
                        type="submit"
                        aria-label="Remove from saved"
                        title="Remove from saved"
                        className="text-zinc-400 transition-colors hover:text-white"
                      >
                        <Bookmark className="size-5" aria-hidden="true" />
                      </button>
                    </form>

                    {isClosed ? (
                      <form action={unsaveJob.bind(null, jobId)}>
                        <button
                          type="submit"
                          className="text-xs font-medium text-red-400 transition-colors hover:text-red-300"
                        >
                          Remove from List
                        </button>
                      </form>
                    ) : isApplied ? (
                      <span className="text-xs font-medium text-emerald-400">Applied ✓</span>
                    ) : (
                      <form action={applyToJob.bind(null, jobId)}>
                        <button type="submit" className={BTN_PRIMARY}>
                          Apply Now
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load more */}
      {pageNumber < pageCount ? (
        <div className="mt-6 text-center">
          <Link
            href={pageHref({ page: String(pageNumber + 1) })}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-5 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/5"
          >
            Load More
          </Link>
        </div>
      ) : null}
    </div>
  );
}
