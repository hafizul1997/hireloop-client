import { cn } from "@/lib/utils";
import { statusLabel } from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  open: "bg-emerald-400/10 text-emerald-400",
  closed: "bg-zinc-500/15 text-zinc-400",
  submitted: "bg-zinc-500/15 text-zinc-300",
  "under-review": "bg-amber-400/10 text-amber-400",
  interview: "bg-sky-400/10 text-sky-400",
  offer: "bg-emerald-400/10 text-emerald-400",
  hired: "bg-emerald-400/15 text-emerald-400",
  rejected: "bg-red-400/10 text-red-400",
};

/** Small pill showing a job/application status. */
export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
        STATUS_STYLES[status] ?? STATUS_STYLES.submitted,
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
