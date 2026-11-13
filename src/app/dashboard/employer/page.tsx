import type { Metadata } from "next";
import { CircleOff, FileText, Users, Zap } from "lucide-react";
import { requireRole } from "@/lib/guards";
import { formatDate } from "@/lib/format";
import { applications, jobs } from "@/lib/db";
import { StatCard } from "../components/stat-card";
import {
  RecentApplications,
  type ApplicationRow,
} from "../components/recent-applications";

export const metadata: Metadata = {
  title: "Employer Dashboard — HireLoop",
};

/** Employer home — stats and the recent-applications table are live MongoDB queries. */
export default async function EmployerDashboardPage() {
  const session = await requireRole("employer");
  const employerId = session.user.id;

  const [totalJobs, totalApplicants, activeJobs, closedJobs, recent] =
    await Promise.all([
      jobs.countDocuments({ employerId }),
      applications.countDocuments({ employerId }),
      jobs.countDocuments({ employerId, status: "open" }),
      jobs.countDocuments({ employerId, status: "closed" }),
      applications
        .find({ employerId })
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray(),
    ]);

  const stats = [
    { label: "Total Job Posts", value: totalJobs, icon: FileText, iconClass: "text-zinc-300" },
    { label: "Total Applicants", value: totalApplicants, icon: Users, iconClass: "text-zinc-300" },
    { label: "Active Jobs", value: activeJobs, icon: Zap, iconClass: "text-zinc-300" },
    { label: "Jobs Closed", value: closedJobs, icon: CircleOff, iconClass: "text-zinc-300" },
  ];

  const rows: ApplicationRow[] = recent.map((doc) => ({
    id: doc._id.toString(),
    name: doc.seekerName,
    role: doc.jobTitle,
    appliedAt: formatDate(doc.createdAt),
    status: doc.status,
  }));

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        Welcome back, {session.user.name || "there"}
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <RecentApplications rows={rows} viewAllHref="/dashboard/employer/applicants" />
    </div>
  );
}
