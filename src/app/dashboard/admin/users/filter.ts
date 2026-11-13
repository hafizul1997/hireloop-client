import type { Filter } from "mongodb";
import type { UserDoc } from "@/lib/db";

/** Escape user input before using it inside a $regex. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Shared by the users page and the CSV export: name/email search plus an
 * exact role filter. Unknown role values are ignored.
 */
export function buildUserFilter(q: string, role: string): Filter<UserDoc> {
  const filter: Filter<UserDoc> = {};

  const query = q.trim();
  if (query) {
    const rx = { $regex: escapeRegExp(query), $options: "i" };
    filter.$or = [{ email: rx }, { name: rx }];
  }

  if (["employee", "employer", "admin"].includes(role)) {
    filter.role = role;
  }

  return filter;
}
