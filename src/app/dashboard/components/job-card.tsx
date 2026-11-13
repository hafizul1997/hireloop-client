import type { ReactNode } from "react";
import Link from "next/link";
import { Inbox } from "lucide-react";
import type { Job } from "@/lib/db";
import { StatusBadge } from "./status-badge";

/** Shared button styles for the small inline actions inside job cards. */
export const BTN_PRIMARY =
  "rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-black transition-colors hover:bg-zinc-200";
export const BTN_SECONDARY =
  "rounded-full border border-white/10 px-4 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white";
export const BTN_DONE =
  "rounded-full border border-white/10 px-4 py-1.5 text-sm text-zinc-500";

type JobCardProps = {
  job: Job;
  /** Optional action buttons (forms) rendered under the job info. */
  footer?: ReactNode;
};

/** Dark card describing a job post, shared by seeker/employer/admin pages. */
export function JobCard({ job, footer }: JobCardProps) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#141414] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold">{job.title}</h3>
          <p className="mt-0.5 text-sm text-zinc-400">
            {job.company} · {job.location}
          </p>
        </div>
        <div className="text-right">
          <StatusBadge status={job.status} />
          {job.salary ? (
            <p className="mt-2 text-sm text-zinc-300">{job.salary}</p>
          ) : null}
          <p className="text-xs text-zinc-500">{job.type}</p>
        </div>
      </div>

      {job.description ? (
        <p className="mt-3 line-clamp-2 text-sm text-zinc-400">{job.description}</p>
      ) : null}

      {footer ? <div className="mt-4 flex flex-wrap gap-2">{footer}</div> : null}
    </div>
  );
}

/** Friendly empty message for lists with no data yet. */
export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-white/5 bg-[#141414] px-6 py-14 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-white/5 text-zinc-400">
        <Inbox className="size-5" aria-hidden="true" />
      </span>
      <p className="mt-4 font-medium">{title}</p>
      {description ? <p className="mt-1 text-sm text-zinc-500">{description}</p> : null}
    </div>
  );
}

/** Consistent page title + subtitle. */
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h1 className="text-xl font-semibold sm:text-2xl">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-zinc-500">{subtitle}</p> : null}
    </div>
  );
}

type CrumbItem = { label: string; href?: string };

/** Small breadcrumb trail, e.g. "Manage jobs / Lead Designer / Update Job Post". */
export function Crumb({ items }: { items: CrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1.5">
          {index > 0 ? <span aria-hidden="true">/</span> : null}
          {item.href ? (
            <Link href={item.href} className="transition-colors hover:text-white">
              {item.label}
            </Link>
          ) : (
            <span className="text-zinc-300">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
