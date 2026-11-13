import Link from "next/link";
import { StatusBadge } from "./status-badge";

/** Plain, serializable row — built from the Mongo application doc. */
export type ApplicationRow = {
  id: string;
  name: string;
  role: string;
  /** "Oct 24, 2023"-style date string, formatted on the server. */
  appliedAt: string;
  status: string;
};

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Section header + table of recent applications (employer dashboard). */
export function RecentApplications({
  rows,
  viewAllHref,
}: {
  rows: ApplicationRow[];
  viewAllHref: string;
}) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Applications</h2>
        <Link
          href={viewAllHref}
          className="text-sm text-zinc-400 underline-offset-4 hover:text-white hover:underline"
        >
          View all
        </Link>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/5 bg-[#141414]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs tracking-wide text-zinc-500 uppercase">
              <th className="px-5 py-3.5 font-medium">Candidate Name</th>
              <th className="px-5 py-3.5 font-medium">Role</th>
              <th className="px-5 py-3.5 font-medium">Date Applied</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-10 text-center text-sm text-zinc-500"
                >
                  No applications yet — they&apos;ll show up here as candidates
                  apply.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.03]"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#5b6cf5] to-[#22d3ee] text-[11px] font-semibold">
                        {initials(row.name)}
                      </span>
                      <span className="truncate font-medium">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-zinc-400">{row.role}</td>
                  <td className="px-5 py-4 text-zinc-400">{row.appliedAt}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
