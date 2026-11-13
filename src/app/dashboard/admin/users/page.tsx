import type { Metadata } from "next";
import { Briefcase, Search, Shield, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { requireRole } from "@/lib/guards";
import { cn } from "@/lib/utils";
import { users } from "@/lib/db";
import { BTN_PRIMARY, EmptyState } from "../../components/job-card";
import { buildUserFilter } from "./filter";
import { ConfirmSubmit } from "../../components/confirm-submit";
import { RoleFilter } from "./components/user-controls";
import { deleteUser, updateUserRole, updateUserStatus } from "./actions";

export const metadata: Metadata = {
  title: "Users — HireLoop",
};

const ROLE_PILLS: Record<
  string,
  { label: string; icon: LucideIcon; cls: string }
> = {
  employee: {
    label: "Seeker",
    icon: UserRound,
    cls: "bg-white/5 text-zinc-300",
  },
  employer: {
    label: "Recruiter",
    icon: Briefcase,
    cls: "bg-indigo-400/10 text-indigo-400",
  },
  admin: {
    label: "Admin",
    icon: Shield,
    cls: "bg-rose-400/10 text-rose-400",
  },
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const fmt = new Intl.NumberFormat("en-US");

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
}

/** Growth footnote for a stat tile, colored by direction. */
function growthFootnote(delta: number | null): { text: string; tone: string } {
  if (delta === null) return { text: "no change yet", tone: "text-zinc-500" };
  return {
    text: `${delta >= 0 ? "+" : ""}${delta}% vs last month`,
    tone: delta >= 0 ? "text-emerald-400" : "text-red-400",
  };
}

/** Admin user directory — live table with search, filters and moderation. */
export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  const session = await requireRole("admin");
  const { q = "", role = "" } = await searchParams;

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const last30 = new Date();
  last30.setDate(last30.getDate() - 30);
  const last60 = new Date();
  last60.setDate(last60.getDate() - 60);

  const filter = buildUserFilter(q, role);

  const [
    totalUsers,
    activeUsers,
    recruiters,
    suspended,
    signups24h,
    usersRecent,
    usersPrev,
    recruitersRecent,
    allUsers,
  ] = await Promise.all([
    users.countDocuments({}),
    users.countDocuments({ status: { $ne: "suspended" } }),
    users.countDocuments({ role: "employer", status: { $ne: "suspended" } }),
    users.countDocuments({ status: "suspended" }),
    users.countDocuments({ createdAt: { $gte: yesterday } }),
    users.countDocuments({ createdAt: { $gte: last30 } }),
    users.countDocuments({ createdAt: { $gte: last60, $lt: last30 } }),
    users.countDocuments({ role: "employer", createdAt: { $gte: last30 } }),
    users.find(filter).sort({ createdAt: -1 }).limit(100).toArray(),
  ]);

  const delta = growthFootnote(
    usersPrev === 0 ? null : Math.round(((usersRecent - usersPrev) / usersPrev) * 100),
  );
  const suspendedPct = totalUsers === 0 ? "0.0" : ((suspended / totalUsers) * 100).toFixed(1);

  const stats = [
    { label: "Total Active Users", value: fmt.format(activeUsers), ...delta },
    {
      label: "Recruiter Growth",
      value: fmt.format(recruiters),
      footnote: `+${fmt.format(recruitersRecent)} this month`,
      tone: "text-amber-400",
    },
    {
      label: "Suspended Accounts",
      value: fmt.format(suspended),
      footnote: `${suspendedPct}% of total`,
      tone: "text-zinc-500",
    },
    {
      label: "New Signups (24h)",
      value: fmt.format(signups24h),
      footnote: "steady activity",
      tone: "text-amber-400",
    },
  ];

  const exportHref = `/api/admin/users/export?${new URLSearchParams({ q, role })}`;

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* Search toolbar */}
      <form action="/dashboard/admin/users" className="w-full max-w-sm">
        {role ? <input type="hidden" name="role" value={role} /> : null}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
            aria-hidden="true"
          />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by email..."
            className="h-9 w-full rounded-lg border border-white/10 bg-[#141414] pl-9 pr-3 text-sm outline-none placeholder:text-zinc-500 focus:border-white/20"
          />
        </div>
      </form>

      {/* Header */}
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">User Management</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Review, filter, and manage platform access for all users.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RoleFilter value={role} />
          <a href={exportHref} className={BTN_PRIMARY}>
            Export List
          </a>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/5 bg-[#141414] p-5"
          >
            <p className="text-sm text-zinc-400">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{stat.value}</p>
            <p className={cn("mt-2 text-xs", stat.tone)}>{stat.footnote}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      {allUsers.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No users found"
            description="Try a different search or role filter."
          />
        </div>
      ) : (
        <section className="mt-6 rounded-2xl border border-white/5 bg-[#141414]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-wider text-zinc-500">
                  <th className="px-5 py-3 font-medium">User Name</th>
                  <th className="px-5 py-3 font-medium">Email Address</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Join Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((user) => {
                  const id = user._id.toString();
                  const isSelf = id === session.user.id;
                  const rolePill = ROLE_PILLS[user.role ?? "employee"] ?? ROLE_PILLS.employee;
                  const active = user.status !== "suspended";
                  const RoleIcon = rolePill.icon;

                  return (
                    <tr
                      key={id}
                      className="border-b border-white/5 last:border-b-0 transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={user.image}
                              alt=""
                              className="size-9 shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-zinc-300">
                              {initials(user.name || user.email)}
                            </span>
                          )}
                          <p className="font-medium">{user.name || "Unnamed"}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-400">{user.email}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium",
                            rolePill.cls,
                          )}
                        >
                          <RoleIcon className="size-3" aria-hidden="true" />
                          {rolePill.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs whitespace-nowrap text-zinc-500">
                        {dateFmt.format(user.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium",
                            active
                              ? "bg-emerald-400/10 text-emerald-400"
                              : "bg-red-400/10 text-red-400",
                          )}
                        >
                          <span
                            className={cn(
                              "size-1.5 rounded-full",
                              active ? "bg-emerald-400" : "bg-red-400",
                            )}
                          />
                          {active ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {isSelf ? (
                          <span className="text-xs text-zinc-600">You</span>
                        ) : user.role === "admin" ? (
                          <span className="text-xs text-zinc-600">—</span>
                        ) : (
                          <div className="flex items-center justify-end gap-3 text-xs font-medium">
                            {/* Role swap: Seeker ↔ Recruiter */}
                            <form action={updateUserRole}>
                              <input type="hidden" name="userId" value={id} />
                              <input
                                type="hidden"
                                name="role"
                                value={user.role === "employer" ? "employee" : "employer"}
                              />
                              <button
                                type="submit"
                                className="text-zinc-300 transition-colors hover:text-white"
                              >
                                {user.role === "employer" ? "Make Seeker" : "Make Recruiter"}
                              </button>
                            </form>
                            {/* Suspend / Activate */}
                            <form action={updateUserStatus}>
                              <input type="hidden" name="userId" value={id} />
                              <input
                                type="hidden"
                                name="suspended"
                                value={String(!active)}
                              />
                              <button
                                type="submit"
                                className={cn(
                                  "transition-colors",
                                  active
                                    ? "text-red-400 hover:text-red-300"
                                    : "text-emerald-400 hover:text-emerald-300",
                                )}
                              >
                                {active ? "Suspend" : "Activate"}
                              </button>
                            </form>
                            {/* Delete — only offered for suspended accounts */}
                            {!active ? (
                              <form action={deleteUser}>
                                <input type="hidden" name="userId" value={id} />
                                <ConfirmSubmit
                                  className="text-zinc-500 transition-colors hover:text-red-400"
                                  message={`Delete ${user.email}? This also removes their jobs, applications and activity.`}
                                >
                                  Delete
                                </ConfirmSubmit>
                              </form>
                            ) : null}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
