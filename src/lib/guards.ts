import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getRoleHome } from "@/lib/role-redirect";

/** Session or bust — redirects to sign-in when unauthenticated. */
export async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  // Suspended accounts lose access immediately (their sessions are revoked
  // by the admin action; this catches any that slip through).
  if (session.user.status === "suspended") {
    await auth.api.signOut({ headers: await headers() });
    redirect("/sign-in?suspended=1");
  }

  return session;
}

/** Session with an exact role — redirects mismatched roles to their home. */
export async function requireRole(role: string) {
  const session = await requireUser();

  if (session.user.role !== role) {
    redirect(getRoleHome(session.user.role));
  }

  return session;
}
