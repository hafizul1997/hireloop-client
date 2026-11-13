import type { Metadata } from "next";
import { Bookmark, CalendarCheck, Gift, Send } from "lucide-react";
import { requireRole } from "@/lib/guards";
import { timeAgo } from "@/lib/format";
import { activities, applications, savedJobs } from "@/lib/db";
import { getDashboardData } from "./data";
import { StatCard } from "./components/stat-card";
import { RecentActivity } from "./components/recent-activity";
import { PageHeader } from "./components/job-card";

export const metadata: Metadata = {
  title: "Seeker Dashboard — HireLoop",
};

/** Employee (job seeker) home — stats are counted live from MongoDB. */
export default async function SeekerDashboardPage() {
  const session = await requireRole("employee");
  const userId = session.user.id;

  const [savedCount, appliedCount, interviewCount, offerCount, recent] =
    await Promise.all([
      savedJobs.countDocuments({ userId }),
      applications.countDocuments({ userId }),
      applications.countDocuments({ userId, status: "interview" }),
      applications.countDocuments({ userId, status: "offer" }),
      activities.find({ userId }).sort({ createdAt: -1 }).limit(5).toArray(),
    ]);

  const stats = [
    { label: "Saved Jobs", value: savedCount, icon: Bookmark, iconClass: "text-zinc-300" },
    { label: "Applications Submitted", value: appliedCount, icon: Send, iconClass: "text-zinc-300" },
    { label: "Interviews Scheduled", value: interviewCount, icon: CalendarCheck, iconClass: "text-amber-400" },
    { label: "Offers Received", value: offerCount, icon: Gift, iconClass: "text-emerald-400" },
  ];

  // Real activity wins; the static sample feed covers brand-new accounts.
  const { activities: fallback } = getDashboardData(session.user.role);
  const activityItems = recent.length
    ? recent.map((doc) => ({
        kind: doc.kind,
        parts: doc.parts,
        time: timeAgo(doc.createdAt),
      }))
    : fallback;

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title={`Welcome back, ${session.user.name?.split(" ")[0] || "there"}!`}
        subtitle="Here's what's happening with your job search today."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-8">
        <RecentActivity activities={activityItems} viewAllHref="/dashboard/applications" />
      </div>
    </div>
  );
}
