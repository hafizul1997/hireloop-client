import type { Metadata } from "next";
import { Briefcase, Building2, CalendarDays, CreditCard, UsersRound, Users } from "lucide-react";
import { requireRole } from "@/lib/guards";
import { growthPercent } from "@/lib/growth";
import { jobs, transactions, users } from "@/lib/db";
import { BTN_PRIMARY, BTN_SECONDARY } from "../components/job-card";
import { OverviewStatCard, TransactionsTable } from "./components/overview";
import type { OverviewStat } from "./components/overview";

export const metadata: Metadata = {
  title: "Admin Dashboard — HireLoop",
};

/** Admin home — platform stats + billing ledger, counted live from MongoDB. */
export default async function AdminDashboardPage() {
  await requireRole("admin");

  // Two 30-day windows for the growth badges (mutated copies, like the
  // "signups today" pattern used elsewhere).
  const last30 = new Date();
  last30.setDate(last30.getDate() - 30);
  const last60 = new Date();
  last60.setDate(last60.getDate() - 60);

  const [
    totalUsers,
    usersRecent,
    usersPrev,
    recruiters,
    recruitersRecent,
    recruitersPrev,
    totalJobs,
    jobsRecent,
    jobsPrev,
    companies,
    revenueAgg,
    recentTransactions,
  ] = await Promise.all([
    users.countDocuments({}),
    users.countDocuments({ createdAt: { $gte: last30 } }),
    users.countDocuments({ createdAt: { $gte: last60, $lt: last30 } }),
    users.countDocuments({ role: "employer" }),
    users.countDocuments({ role: "employer", createdAt: { $gte: last30 } }),
    users.countDocuments({ role: "employer", createdAt: { $gte: last60, $lt: last30 } }),
    jobs.countDocuments({}),
    jobs.countDocuments({ createdAt: { $gte: last30 } }),
    jobs.countDocuments({ createdAt: { $gte: last60, $lt: last30 } }),
    jobs.distinct("company", { company: { $ne: "" } }),
    // Expected revenue: successful + pending subscriptions (failed excluded).
    transactions
      .aggregate<{ _id: null; total: number }>([
        { $match: { status: { $ne: "failed" } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])
      .toArray(),
    transactions.find().sort({ createdAt: -1 }).limit(5).toArray(),
  ]);

  const fmt = new Intl.NumberFormat("en-US");
  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const stats: OverviewStat[] = [
    {
      label: "Total Users",
      value: fmt.format(totalUsers),
      icon: Users,
      delta: growthPercent(usersRecent, usersPrev),
    },
    {
      label: "Total Recruiters",
      value: fmt.format(recruiters),
      icon: UsersRound,
      delta: growthPercent(recruitersRecent, recruitersPrev),
    },
    {
      label: "Total Companies",
      value: fmt.format(companies.length),
      icon: Building2,
      delta: null,
    },
    {
      label: "Jobs Posted",
      value: fmt.format(totalJobs),
      icon: Briefcase,
      delta: growthPercent(jobsRecent, jobsPrev),
    },
    {
      label: "Platform Revenue",
      value: money.format(revenueAgg[0]?.total ?? 0),
      icon: CreditCard,
      delta: null,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Real-time platform performance and growth metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className={`inline-flex items-center gap-2 ${BTN_SECONDARY}`}>
            <CalendarDays className="size-4" aria-hidden="true" />
            Last 30 Days
          </button>
          <button type="button" className={BTN_PRIMARY}>
            Export Report
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <OverviewStatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-8">
        <TransactionsTable transactions={recentTransactions} />
      </div>
    </div>
  );
}
