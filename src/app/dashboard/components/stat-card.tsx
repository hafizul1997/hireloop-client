import { cn } from "@/lib/utils";
import type { Stat } from "../data";

/**
 * Dark stat tile matching the reference design: icon tile on top, muted
 * label, then the big value. Props come straight from `data.ts` stats.
 */
export function StatCard({ label, value, icon: Icon, iconClass }: Stat) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#141414] p-5">
      <span className="flex size-10 items-center justify-center rounded-xl bg-white/5">
        <Icon className={cn("size-5", iconClass)} aria-hidden="true" />
      </span>
      <p className="mt-4 text-sm text-zinc-400">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
