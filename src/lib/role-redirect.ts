const ROLE_HOME: Record<string, string> = {
  employee: "/dashboard",
  employer: "/dashboard/employer",
  admin: "/dashboard/admin",
};

/** Landing path for a user role after authentication. */
export function getRoleHome(role?: string | null): string {
  return (role && ROLE_HOME[role]) || "/";
}
