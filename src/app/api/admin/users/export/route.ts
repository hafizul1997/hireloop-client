import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { users } from "@/lib/db";
import { buildUserFilter } from "@/app/dashboard/admin/users/filter";

/** CSV export of the admin user directory — honors the same ?q= / ?role= filters. */
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  const q = request.nextUrl.searchParams.get("q") ?? "";
  const role = request.nextUrl.searchParams.get("role") ?? "";

  const allUsers = await users
    .find(buildUserFilter(q, role))
    .sort({ createdAt: -1 })
    .limit(1000)
    .toArray();

  // Quote every field so commas inside names/emails stay safe.
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
  const header = "Name,Email,Role,Status,Joined";
  const rows = allUsers.map((user) =>
    [
      user.name ?? "",
      user.email,
      user.role ?? "employee",
      user.status === "suspended" ? "suspended" : "active",
      user.createdAt.toISOString(),
    ]
      .map(escape)
      .join(","),
  );

  return new Response([header, ...rows].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="hireloop-users.csv"',
    },
  });
}
