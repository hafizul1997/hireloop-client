import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Bookmark,
  FileText,
  LayoutDashboard,
  Settings,
  SquarePlus,
  Users,
  Wallet,
} from "lucide-react";
import type { ActivityKind } from "@/lib/db";

export type DashboardRole = "employee" | "employer" | "admin";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type Stat = {
  label: string;
  value: number;
  icon: LucideIcon;
  /** Tailwind color class for the stat icon. */
  iconClass: string;
};

export type TextPart = {
  text: string;
  /** Rendered in the amber accent color when true. */
  highlight?: boolean;
};

export type Activity = {
  kind: ActivityKind;
  parts: TextPart[];
  time: string;
};

export type DashboardData = {
  /** Sidebar user-card role label, e.g. "Recruiter". */
  roleLabel: string;
  /** Role's settings page — target of the "Prepare account" pill. */
  settingsHref: string;
  /** Static sample feed — shown until the user has real activity in the DB. */
  activities: Activity[];
  /** Sidebar CTA + floating action button target. */
  cta: { label: string; href: string };
};

/** Sidebar links per role — every route has a real page under src/app/dashboard. */
const NAV_ITEMS: Record<DashboardRole, NavItem[]> = {
  employee: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
    { label: "Saved Jobs", href: "/dashboard/saved-jobs", icon: Bookmark },
    { label: "Applications", href: "/dashboard/applications", icon: FileText },
    { label: "Billing", href: "/dashboard/billing", icon: Wallet },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ],
  employer: [
    { label: "Dashboard", href: "/dashboard/employer", icon: LayoutDashboard },
    { label: "Add Job", href: "/dashboard/employer/jobs/new", icon: SquarePlus },
    { label: "Manage Jobs", href: "/dashboard/employer/jobs", icon: Briefcase },
    { label: "Applications", href: "/dashboard/employer/applicants", icon: FileText },
    { label: "Settings", href: "/dashboard/employer/settings", icon: Settings },
  ],
  admin: [
    { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Users", href: "/dashboard/admin/users", icon: Users },
    { label: "Job Posts", href: "/dashboard/admin/jobs", icon: Briefcase },
    { label: "Payments", href: "/dashboard/admin/payments", icon: Wallet },
    { label: "Settings", href: "/dashboard/admin/settings", icon: Settings },
  ],
};

/**
 * Per-role portal info. `activities` are static samples used as a fallback
 * while a user has no real activity yet — everything else on the dashboard
 * is computed live from MongoDB.
 */
const DASHBOARD_DATA: Record<DashboardRole, DashboardData> = {
  employee: {
    roleLabel: "Job Seeker",
    settingsHref: "/dashboard/settings",
    activities: [
      {
        kind: "status",
        parts: [
          { text: "Application for " },
          { text: "Senior Product Designer", highlight: true },
          { text: " at " },
          { text: "TechFlow", highlight: true },
          { text: " updated to " },
          { text: "Under Review", highlight: true },
        ],
        time: "2 hours ago",
      },
      {
        kind: "alert",
        parts: [
          { text: "New Job Alert: " },
          { text: "Lead Frontend Engineer", highlight: true },
          { text: " at " },
          { text: "FitGrid", highlight: true },
          { text: " matches your profile." },
        ],
        time: "5 hours ago",
      },
      {
        kind: "message",
        parts: [
          { text: "You have a new message from " },
          { text: "Sarah Jenkins", highlight: true },
          { text: " (Hiring Manager at " },
          { text: "CloudOps", highlight: true },
          { text: ")." },
        ],
        time: "1 day ago",
      },
    ],
    cta: { label: "Post Resume", href: "/dashboard/jobs" },
  },

  employer: {
    roleLabel: "Recruiter",
    settingsHref: "/dashboard/employer/settings",
    activities: [
      {
        kind: "applicant",
        parts: [
          { text: "New applicant " },
          { text: "Maya Chen", highlight: true },
          { text: " applied for " },
          { text: "Senior React Developer", highlight: true },
          { text: "." },
        ],
        time: "20 minutes ago",
      },
      {
        kind: "interview",
        parts: [
          { text: "Interview with " },
          { text: "Dev Patel", highlight: true },
          { text: " scheduled for " },
          { text: "Tomorrow, 10:00 AM", highlight: true },
          { text: "." },
        ],
        time: "3 hours ago",
      },
      {
        kind: "job",
        parts: [
          { text: "Your job post " },
          { text: "Frontend Engineer", highlight: true },
          { text: " was approved and is now live." },
        ],
        time: "1 day ago",
      },
    ],
    cta: { label: "Post a Job", href: "/dashboard/employer/jobs/new" },
  },

  admin: {
    roleLabel: "Administrator",
    settingsHref: "/dashboard/admin/settings",
    activities: [
      {
        kind: "user",
        parts: [
          { text: "New user " },
          { text: "Aisha Khan", highlight: true },
          { text: " joined as an " },
          { text: "employer", highlight: true },
          { text: "." },
        ],
        time: "35 minutes ago",
      },
      {
        kind: "applicant",
        parts: [
          { text: "12", highlight: true },
          { text: " new applications were submitted in the last 24 hours." },
        ],
        time: "2 hours ago",
      },
      {
        kind: "job",
        parts: [
          { text: "NexaLabs", highlight: true },
          { text: " posted a new job on the platform." },
        ],
        time: "6 hours ago",
      },
    ],
    cta: { label: "Manage Users", href: "/dashboard/admin/users" },
  },
};

/** Map any stored role value to a known dashboard role (defaults to employee). */
export function normalizeRole(role?: string | null): DashboardRole {
  return role === "employer" || role === "admin" ? role : "employee";
}

export function getNavItems(role?: string | null): NavItem[] {
  return NAV_ITEMS[normalizeRole(role)];
}

export function getDashboardData(role?: string | null): DashboardData {
  return DASHBOARD_DATA[normalizeRole(role)];
}
