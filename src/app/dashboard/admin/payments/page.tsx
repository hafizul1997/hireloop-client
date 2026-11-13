import type { Metadata } from "next";
import {
  Building2,
  CalendarDays,
  CreditCard,
  UsersRound,
} from "lucide-react";
import { requireRole } from "@/lib/guards";
import { growthPercent } from "@/lib/growth";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { transactions } from "@/lib/db";
import { BTN_PRIMARY } from "../../components/job-card";
import { OverviewStatCard } from "../components/overview";
import { TxnStatusFilter } from "./components/txn-controls";
import { planTier, TIER_PLAN_MATCH, buildTxnFilter } from "./tiers";

export const metadata: Metadata = {
  title: "Payments — HireLoop",
};

const TIER_PILLS: Record<string, string> = {
  enterprise: "bg-indigo-400/10 text-indigo-400",
  pro: "bg-white/5 text-zinc-300",
  starter: "bg-white/5 text-zinc-300",
};

const STATUS_PILLS: Record<string, { cls: string; label: string }> = {
  success: { cls: "bg-emerald-400/10 text-emerald-400", label: "Success" },
  pending: { cls: "bg-amber-400/10 text-amber-400", label: "Pending" },
  failed: { cls: "bg-red-400/10 text-red-400", label: "Failed" },
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const fmt = new Intl.NumberFormat("en-US");
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const moneyCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function initials(email: string): string {
  return email.slice(0, 2).toUpperCase();
}

/** Admin billing — revenue stats plus the subscription ledger. */
export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole("admin");
  const { status = "" } = await searchParams;

  // Two 30-day windows power the growth badges.
  const last30 = new Date();
  last30.setDate(last30.getDate() - 30);
  const last60 = new Date();
  last60.setDate(last60.getDate() - 60);

  /** Sum of non-failed transaction amounts inside a window. */
  function revenueWhere(match: Record<string, unknown>) {
    return transactions
      .aggregate<{ _id: null; total: number }>([
        { $match: { ...match, status: { $ne: "failed" } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])
      .toArray();
  }

  const [totalAgg, monthAgg, prevAgg, activePro, activeEnt, proNow, proPrev, entNow, entPrev, recent] =
    await Promise.all([
      revenueWhere({}),
      revenueWhere({ createdAt: { $gte: last30 } }),
      revenueWhere({ createdAt: { $gte: last60, $lt: last30 } }),
      // Distinct paying accounts per plan tier (all-time "active" users).
      transactions.distinct("email", { plan: TIER_PLAN_MATCH.pro, status: { $ne: "failed" } }),
      transactions.distinct("email", { plan: TIER_PLAN_MATCH.enterprise, status: { $ne: "failed" } }),
      // New tier subscribers per window for the growth badges.
      transactions.distinct("email", { plan: TIER_PLAN_MATCH.pro, status: { $ne: "failed" }, createdAt: { $gte: last30 } }),
      transactions.distinct("email", { plan: TIER_PLAN_MATCH.pro, status: { $ne: "failed" }, createdAt: { $gte: last60, $lt: last30 } }),
      transactions.distinct("email", { plan: TIER_PLAN_MATCH.enterprise, status: { $ne: "failed" }, createdAt: { $gte: last30 } }),
      transactions.distinct("email", { plan: TIER_PLAN_MATCH.enterprise, status: { $ne: "failed" }, createdAt: { $gte: last60, $lt: last30 } }),
      transactions.find(buildTxnFilter(status)).sort({ createdAt: -1 }).limit(100).toArray(),
    ]);

  const revenueDelta = growthPercent(monthAgg[0]?.total ?? 0, prevAgg[0]?.total ?? 0);

  const stats = [
    {
      label: "Total Revenue",
      value: money.format(totalAgg[0]?.total ?? 0),
      icon: CreditCard,
      delta: revenueDelta,
    },
    {
      label: "Monthly Revenue",
      value: money.format(monthAgg[0]?.total ?? 0),
      icon: CalendarDays,
      delta: revenueDelta,
    },
    {
      label: "Active Pro Users",
      value: fmt.format(activePro.length),
      icon: UsersRound,
      delta: growthPercent(proNow.length, proPrev.length),
    },
    {
      label: "Active Enterprise Users",
      value: fmt.format(activeEnt.length),
      icon: Building2,
      delta: growthPercent(entNow.length, entPrev.length),
    },
  ];

  const exportHref = `/api/admin/transactions/export?${new URLSearchParams({ status })}`;

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold sm:text-2xl">Payments &amp; Subscriptions</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Comprehensive overview of platform revenue and active subscriptions.
        </p>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <OverviewStatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Recent transactions */}
      <section className="mt-8 rounded-2xl border border-white/5 bg-[#141414]">
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
          <h2 className="font-semibold">Recent Transactions</h2>
          <div className="flex items-center gap-2">
            <TxnStatusFilter value={status} />
            <a href={exportHref} className={cn(BTN_PRIMARY, "text-sm")}>
              <span className="inline-flex items-center gap-1.5">Export CSV</span>
            </a>
          </div>
        </div>

        {recent.length === 0 ? (
          <p className="px-5 pb-8 pt-2 text-sm text-zinc-500">
            No transactions match this filter yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-y border-white/5 text-left text-[11px] uppercase tracking-wider text-zinc-500">
                  <th className="px-5 py-3 font-medium">User Email</th>
                  <th className="px-5 py-3 font-medium">Plan</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Transaction ID</th>
                  <th className="px-5 py-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((txn) => {
                  const pill = STATUS_PILLS[txn.status] ?? STATUS_PILLS.pending;
                  const tier = planTier(txn.plan);

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
                          <span className="truncate font-medium">{txn.email}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            "inline-block rounded-md px-2.5 py-1 text-xs font-medium",
                            TIER_PILLS[tier],
                          )}
                        >
                          {tier === "pro" ? "Pro" : tier === "enterprise" ? "Enterprise" : "Starter"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium">
                        {moneyCents.format(txn.amount)}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs whitespace-nowrap text-zinc-300">
                          {dateFmt.format(txn.createdAt)}
                        </p>
                        <p className="text-[11px] text-zinc-500">{timeAgo(txn.createdAt)}</p>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-zinc-400">
                        {txn.txnId}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="flex items-center justify-end gap-2">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium",
                              pill.cls,
                            )}
                          >
                            <span className="size-1.5 rounded-full bg-current" />
                            {pill.label}
                          </span>
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
    </div>
  );
}
