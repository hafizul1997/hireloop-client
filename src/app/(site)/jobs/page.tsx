import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { jobs, savedJobs } from "@/lib/db";
import { JobBrowseCard } from "@/components/job-browse-card";
import { JobTypeFilters, SortSelect } from "./jobs-controls";

export const metadata: Metadata = {
  title: "Browse Jobs — HireLoop",
};

const PER_PAGE = 6;
const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

/** Search form target — redirects to /jobs with the ?q= param applied. */
async function searchJobs(formData: FormData) {
  "use server";

  const q = String(formData.get("q") ?? "").trim();
  redirect(q ? `/jobs?q=${encodeURIComponent(q)}` : "/jobs");
}

/** Build a /jobs URL preserving the active query/filters at a given page. */
function pageHref(base: URLSearchParams, page: number): string {
  const query = new URLSearchParams(base);
  if (page > 1) query.set("page", String(page));
  return query.size ? `/jobs?${query}` : "/jobs";
}

/** Page numbers with ellipses for long ranges, e.g. 1 … 4 5 6 … 208. */
function pageList(current: number, count: number): (number | "…")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);

  const wanted = new Set(
    [1, count, current - 1, current, current + 1].filter((p) => p >= 1 && p <= count),
  );
  const sorted = [...wanted].sort((a, b) => a - b);

  const list: (number | "…")[] = [];
  for (const [i, p] of sorted.entries()) {
    if (i > 0 && p - sorted[i - 1] > 1) list.push("…");
    list.push(p);
  }
  return list;
}

/** Public job board — open listings with search, type filters, sort, pagination. */
export default async function PublicJobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = String(params.q ?? "").trim();
  const selectedTypes = String(params.type ?? "")
    .split(",")
    .filter((type) => JOB_TYPES.includes(type));
  const sort = params.sort === "oldest" ? "oldest" : "recent";

  // Live MongoDB filter — open jobs, optional text search + type filter.
  const match: Record<string, unknown> = { status: "open" };
  if (q) {
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = { $regex: escaped, $options: "i" };
    match.$or = ["title", "company", "category"].map((field) => ({
      [field]: pattern,
    }));
  }
  if (selectedTypes.length) match.type = { $in: selectedTypes };

  const [total, typeDocs, session] = await Promise.all([
    jobs.countDocuments(match),
    jobs
      .aggregate<{ _id: string; count: number }>([
        { $match: match },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ])
      .toArray(),
    auth.api.getSession({ headers: await headers() }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(Math.max(1, Number(params.page) || 1), pageCount);

  const [listings, saved] = await Promise.all([
    jobs
      .find(match)
      .sort({ createdAt: sort === "recent" ? -1 : 1 })
      .skip((page - 1) * PER_PAGE)
      .limit(PER_PAGE)
      .toArray(),
    // Save state only matters for signed-in seekers.
    session?.user.role === "employee"
      ? savedJobs.find({ userId: session.user.id }).toArray()
      : Promise.resolve([]),
  ]);

  const savedIds = new Set(saved.map((doc) => doc.jobId.toString()));
  const viewer = session
    ? { id: session.user.id, role: session.user.role ?? "employee" }
    : null;

  const typeCounts = Object.fromEntries(
    typeDocs.map((doc) => [doc._id, doc.count]),
  ) as Record<string, number>;

  // Base query (without page) reused by the pagination links.
  const baseQuery = new URLSearchParams();
  if (q) baseQuery.set("q", q);
  if (selectedTypes.length) baseQuery.set("type", selectedTypes.join(","));
  if (sort !== "recent") baseQuery.set("sort", sort);

  return (
    <main className="bg-zinc-100 pb-12 text-zinc-900">
      <div className="mx-auto w-full max-w-6xl px-4 pt-8 sm:px-6">
        {/* Search bar */}
        <form action={searchJobs} className="flex flex-wrap gap-2">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
              aria-hidden="true"
            />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search by job title, keywords…"
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white pr-4 pl-10 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#5b6cf5]"
            />
          </div>
          <button
            type="submit"
            className="h-11 rounded-xl bg-white px-5 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:bg-zinc-200"
          >
            Search Jobs
          </button>
        </form>

        <div className="mt-6 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* Filters sidebar */}
          <aside className="h-fit rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-zinc-900">Filters</p>
            <p className="mt-3 mb-1.5 text-xs font-medium tracking-wide text-zinc-500 uppercase">
              Job Type
            </p>
            <JobTypeFilters types={JOB_TYPES} counts={typeCounts} />
          </aside>

          {/* Results */}
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-zinc-600">
                Found{" "}
                <span className="font-semibold text-zinc-900">{total}</span>{" "}
                Professional jobs
              </p>
              <SortSelect value={sort} />
            </div>

            <div className="mt-4 space-y-3">
              {listings.length === 0 ? (
                <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                  <p className="font-medium text-zinc-900">No jobs found</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Try a different search or clear the filters.
                  </p>
                </div>
              ) : (
                listings.map((job) => (
                  <JobBrowseCard
                    key={job._id.toString()}
                    job={job}
                    viewer={viewer}
                    saved={savedIds.has(job._id.toString())}
                  />
                ))
              )}
            </div>

            {/* Pagination — dark control bar, white current-page chip */}
            {pageCount > 1 ? (
              <nav
                aria-label="Pagination"
                className="mt-6 flex justify-center"
              >
                <div className="inline-flex items-center gap-1 rounded-xl bg-zinc-900 p-1.5 shadow-sm">
                  <Link
                    href={pageHref(baseQuery, Math.max(1, page - 1))}
                    aria-label="Previous page"
                    aria-disabled={page === 1}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg text-sm transition-colors",
                      page === 1
                        ? "pointer-events-none text-zinc-600"
                        : "text-zinc-300 hover:bg-zinc-800 hover:text-white",
                    )}
                  >
                    <ChevronLeft className="size-4" aria-hidden="true" />
                  </Link>

                  {pageList(page, pageCount).map((entry, index) =>
                    entry === "…" ? (
                      <span
                        key={`gap-${index}`}
                        className="flex size-8 items-center justify-center text-sm text-zinc-500"
                      >
                        …
                      </span>
                    ) : entry === page ? (
                      <span
                        key={entry}
                        aria-current="page"
                        className="flex size-8 items-center justify-center rounded-lg bg-white text-sm font-semibold text-zinc-900 shadow-sm"
                      >
                        {entry}
                      </span>
                    ) : (
                      <Link
                        key={entry}
                        href={pageHref(baseQuery, entry)}
                        className="flex size-8 items-center justify-center rounded-lg text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                      >
                        {entry}
                      </Link>
                    ),
                  )}

                  <Link
                    href={pageHref(baseQuery, Math.min(pageCount, page + 1))}
                    aria-label="Next page"
                    aria-disabled={page === pageCount}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg text-sm transition-colors",
                      page === pageCount
                        ? "pointer-events-none text-zinc-600"
                        : "text-zinc-300 hover:bg-zinc-800 hover:text-white",
                    )}
                  >
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </nav>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
