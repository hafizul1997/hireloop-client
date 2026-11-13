import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TransactionDoc } from "@/lib/db";
import { EmptyState } from "../../components/job-card";

// ---------------------------------------------------------------------------
// Stat cards — icon tile + live delta badge + faint background icon
// ---------------------------------------------------------------------------

export type OverviewStat = {
  label: string;
  /** Pre-formatted value (number or currency). */
  value: string;
  icon: LucideIcon;
  /** % change vs the previous 30 days; null renders an em dash. */
  delta: number | null;
};

/** Admin overview stat card: label under a big number, ghost icon on the right. */
export function OverviewStatCard({ label, value, icon: Icon, delta }: OverviewStat) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#141414] p-5">
      <Icon
        className="absolute -right-3 -bottom-2 size-20 text-white/[0.04]"
        aria-hidden="true"
      />
      <div className="relative flex items-start justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-white/5 text-zinc-300">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        {delta === null ? (
          <span className="text-xs text-zinc-600">—</span>
        ) : (
          <span
            className={cn(
              "text-xs font-medium",
              delta >= 0 ? "text-emerald-400" : "text-red-400",
            )}
          >
            {delta >= 0 ? "+" : ""}
            {delta}%
          </span>
        )}
      </div>
      <p className="relative mt-4 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="relative mt-1 text-sm text-zinc-400">{label}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Subscription transactions table
// ---------------------------------------------------------------------------

const STATUS_STYLES: Record<
  TransactionDoc["status"],
  { dot: string; text: string; label: string }
> = {
  success: { dot: "bg-emerald-400", text: "text-emerald-400", label: "Success" },
  pending: { dot: "bg-amber-400", text: "text-amber-400", label: "Pending" },
  failed: { dot: "bg-red-400", text: "text-red-400", label: "Failed" },
};

function initials(email: string): string {
  return email.slice(0, 2).toUpperCase();
}

/** "Recent Subscription Transactions" card with the platform billing ledger. */
export function TransactionsTable({ transactions }: { transactions: TransactionDoc[] }) {
  const dateFmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const moneyFmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <section className="rounded-2xl border border-white/5 bg-[#141414]">
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
        <h2 className="font-semibold">Recent Subscription Transactions</h2>
        <Link
          href="/dashboard/admin/payments"
          className="text-sm text-zinc-500 transition-colors hover:text-white"
        >
          View All Activity
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="px-5 pb-8">
          <EmptyState
            title="No transactions yet"
            description="Subscription payments will appear here once billing goes live."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-y border-white/5 text-left text-[11px] uppercase tracking-wider text-zinc-500">
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Plan Type</th>
                <th className="px-5 py-3 font-medium">Transaction ID</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => {
                const status = STATUS_STYLES[txn.status] ?? STATUS_STYLES.pending;

                return (
                  <tr
                    key={txn.txnId}
                    className="border-b border-white/5 last:border-b-0 transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold uppercase text-zinc-300">
                          {initials(txn.email)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{txn.email}</p>
                          <p className="truncate text-xs text-zinc-500">{txn.company}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-block rounded-md bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
                        {txn.plan}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-zinc-400">
                      {txn.txnId}
                    </td>
                    <td className="px-5 py-3.5 font-medium">
                      {moneyFmt.format(txn.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-xs whitespace-nowrap text-zinc-500">
                      {dateFmt.format(txn.createdAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-2 text-xs font-medium">
                        <span className={cn("size-1.5 rounded-full", status.dot)} />
                        <span className={status.text}>{status.label}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
