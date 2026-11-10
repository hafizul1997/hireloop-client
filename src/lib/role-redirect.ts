const ROLE_HOME: Record<string, string> = {
  employee: "/",
  employer: "/employer",
  admin: "/admin",
};

/** Landing path for a user role after authentication. */
export function getRoleHome(role?: string | null): string {
  return (role && ROLE_HOME[role]) || "/";
}
