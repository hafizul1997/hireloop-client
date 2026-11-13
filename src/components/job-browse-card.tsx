import Link from "next/link";
import { Bookmark, Building2, MapPin } from "lucide-react";
import type { WithId } from "mongodb";
import { saveJob, unsaveJob } from "@/app/dashboard/actions";
import type { Job } from "@/lib/db";

const tagClass =
  "inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300";

/**
 * Public job-board card (dark) — logo tile, title, company · location,
 * tag pills, and a bookmark action: save/unsave for signed-in seekers,
 * sign-in link for guests. Hidden for roles that don't save jobs.
 */
export function JobBrowseCard({
  job,
  viewer,
  saved,
}: {
  job: WithId<Job>;
  /** Signed-in viewer summary, or null for guests. */
  viewer: { id: string; role: string } | null;
  saved: boolean;
}) {
  const jobId = job._id.toString();

  return (
    <div className="rounded-2xl border border-white/5 bg-[#141414] p-5 text-white">
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#5b6cf5] to-[#22d3ee] text-sm font-semibold">
          {job.company[0]?.toUpperCase() ?? "?"}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">{job.title}</h3>
          <p className="mt-0.5 truncate text-sm text-zinc-400">
            {job.company} · {job.location || "—"}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {job.workMode ? <span className={tagClass}>{job.workMode}</span> : null}
            {job.salary ? <span className={tagClass}>{job.salary}</span> : null}
            <span className={tagClass}>{job.type}</span>
          </div>
        </div>

        {viewer?.role === "employee" ? (
          <form action={(saved ? unsaveJob : saveJob).bind(null, jobId)}>
            <button
              type="submit"
              aria-label={saved ? "Remove from saved jobs" : "Save job"}
              title={saved ? "Unsave" : "Save job"}
              className="flex size-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <Bookmark
                className={saved ? "size-5 fill-current text-[#8b9bff]" : "size-5"}
                aria-hidden="true"
              />
            </button>
          </form>
        ) : !viewer ? (
          <Link
            href="/sign-in"
            aria-label="Sign in to save jobs"
            title="Sign in to save jobs"
            className="flex size-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <Bookmark className="size-5" aria-hidden="true" />
          </Link>
        ) : null}
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-zinc-500">
        <Building2 className="size-3.5" aria-hidden="true" />
        {job.category || "Other"}
        <span aria-hidden="true">·</span>
        <MapPin className="size-3.5" aria-hidden="true" />
        {job.workMode || "Onsite"}
      </p>
    </div>
  );
}
