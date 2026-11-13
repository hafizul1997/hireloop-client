import Link from "next/link";
import {
  BriefcaseBusiness,
  Building2,
  MapPin,
  PencilLine,
  SquareArrowOutUpRight,
  Trash2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { employerDeleteJob, toggleJobStatus } from "@/app/dashboard/actions";
import { ConfirmSubmit } from "./confirm-submit";
import { RowMenu } from "./row-menu";

/** Plain, serializable row — built from the Mongo job doc on the page. */
export type JobPostRow = {
  id: string;
  title: string;
  category: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  applicants: number;
  status: "open" | "closed";
  deadline: string;
  posted: string;
};

const thClass =
  "px-4 py-3 text-left text-xs font-medium tracking-wide text-zinc-500 uppercase";
const tdClass = "px-4 py-3.5 align-middle";
const iconBtnClass =
  "flex size-8 items-center justify-center rounded-lg border border-white/10 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white";
const menuItemBtn =
  "block w-full bg-transparent text-left outline-none cursor-pointer";

/**
 * "Manage Job Posts" table for the employer dashboard — Update (edit link),
 * delete (confirmed server action) and a kebab menu with open/close +
 * applicants. Rows arrive pre-formatted from the page.
 */
export function JobPostsTable({ rows }: { rows: JobPostRow[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#141414]">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="border-b border-white/5">
          <tr>
            <th className={thClass}>Job Title &amp; Dept</th>
            <th className={thClass}>Company &amp; Location</th>
            <th className={thClass}>Type</th>
            <th className={thClass}>Compensation</th>
            <th className={thClass}>Applicants</th>
            <th className={thClass}>Status</th>
            <th className={thClass}>Deadline</th>
            <th className={`${thClass} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-12 text-center text-sm text-zinc-500">
                No jobs posted yet — hit “New Job Post” to publish your first opening.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.03]"
              >
                {/* Title & dept */}
                <td className={tdClass}>
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-zinc-300">
                      <BriefcaseBusiness className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{row.title}</p>
                      <span className="mt-0.5 inline-block rounded-md bg-white/5 px-1.5 py-0.5 text-[11px] text-zinc-400">
                        {row.category}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Company & location */}
                <td className={cn(tdClass, "text-zinc-400")}>
                  <p className="flex items-center gap-1.5 text-white">
                    <Building2 className="size-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{row.company}</span>
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs">
                    <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{row.location || "—"}</span>
                  </p>
                </td>

                {/* Type */}
                <td className={tdClass}>
                  <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-zinc-300">
                    {row.type}
                  </span>
                </td>

                {/* Compensation */}
                <td className={cn(tdClass, "text-zinc-300")}>
                  {row.salary || "—"}
                </td>

                {/* Applicants */}
                <td className={cn(tdClass, "text-zinc-300")}>
                  <span className="flex items-center gap-1.5">
                    <Users className="size-3.5 text-zinc-500" aria-hidden="true" />
                    {row.applicants} Candidates
                  </span>
                </td>

                {/* Status */}
                <td className={tdClass}>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                      row.status === "open"
                        ? "bg-emerald-400/10 text-emerald-400"
                        : "bg-zinc-500/15 text-zinc-400",
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        row.status === "open" ? "bg-emerald-400" : "bg-zinc-500",
                      )}
                    />
                    {row.status === "open" ? "Active" : "Expired"}
                  </span>
                </td>

                {/* Deadline */}
                <td className={cn(tdClass, "text-zinc-300")}>
                  <p>{row.deadline}</p>
                  <p className="mt-1 text-xs text-zinc-500">{row.posted}</p>
                </td>

                {/* Actions */}
                <td className={cn(tdClass, "text-right")}>
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href={`/dashboard/employer/jobs/${row.id}/edit`}
                      className="flex h-8 items-center gap-1.5 rounded-lg border border-[#5b6cf5]/40 bg-[#5b6cf5]/15 px-2.5 text-xs font-medium text-[#8b9bff] transition-colors hover:bg-[#5b6cf5]/25"
                    >
                      <PencilLine className="size-3.5" aria-hidden="true" />
                      Update
                    </Link>

                    <form action={employerDeleteJob.bind(null, row.id)}>
                      <ConfirmSubmit
                        className={iconBtnClass}
                        message={`Delete “${row.title}” and all its applications? This cannot be undone.`}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                        <span className="sr-only">Delete job</span>
                      </ConfirmSubmit>
                    </form>

                    <RowMenu label={`More actions for ${row.title}`}>
                      <form action={toggleJobStatus.bind(null, row.id)}>
                        <button type="submit" className={menuItemBtn + " px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white cursor-pointer"}>
                          {row.status === "open" ? "Mark as Closed" : "Reopen Job"}
                        </button>
                      </form>
                      <Link
                        href="/dashboard/employer/applicants"
                        className="flex items-center gap-1.5 px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <SquareArrowOutUpRight className="size-3.5" aria-hidden="true" />
                        View Applicants
                      </Link>
                    </RowMenu>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
