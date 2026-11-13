import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  BellRing,
  Briefcase,
  CalendarCheck,
  Mail,
  RefreshCw,
  UserPlus,
  Users,
} from "lucide-react";
import type { ActivityKind } from "@/lib/db";
import type { Activity } from "../data";

const ACTIVITY_ICONS: Record<ActivityKind, LucideIcon> = {
  status: RefreshCw,
  alert: BellRing,
  message: Mail,
  applicant: UserPlus,
  job: Briefcase,
  interview: CalendarCheck,
  user: Users,
};

type RecentActivityProps = {
  activities: Activity[];
  /** "View all" target — defaults to the role's activity placeholder page. */
  viewAllHref?: string;
};

/** "Recent Activity" section: heading + icon rows with timestamps. */
export function RecentActivity({ activities, viewAllHref }: RecentActivityProps) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="text-sm text-zinc-500 transition-colors hover:text-white"
          >
            View All Activity
          </Link>
        ) : null}
      </div>

      <ul className="mt-4 space-y-3">
        {activities.map((activity, index) => {
          const Icon = ACTIVITY_ICONS[activity.kind] ?? BellRing;

          return (
            <li
              key={index}
              className="flex items-center gap-4 rounded-2xl border border-white/5 bg-[#141414] p-4"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-zinc-300">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <p className="flex-1 text-sm text-zinc-400">
                {activity.parts.map((part, partIndex) =>
                  part.highlight ? (
                    <span key={partIndex} className="font-medium text-amber-400">
                      {part.text}
                    </span>
                  ) : (
                    <span key={partIndex}>{part.text}</span>
                  ),
                )}
              </p>
              <span className="shrink-0 text-xs text-zinc-500">{activity.time}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
