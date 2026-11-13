import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { normalizeRole } from "./data";
import { DashboardSidebar } from "./components/sidebar";
import { Topbar } from "./components/topbar";
import { Fab } from "./components/fab";

export const metadata: Metadata = {
  title: "Dashboard — HireLoop",
  description: "Your personal HireLoop workspace.",
};

/** Dark sidebar tokens matching the portal palette (#0a0a0a surface). */
const sidebarStyle = {
  "--sidebar": "#0a0a0a",
  "--sidebar-foreground": "#a1a1aa",
  "--sidebar-accent": "rgba(255, 255, 255, 0.08)",
  "--sidebar-accent-foreground": "#ffffff",
  "--sidebar-border": "rgba(255, 255, 255, 0.08)",
} as CSSProperties;

/** Authenticated area — every /dashboard/* page requires a session. */
export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  const role = normalizeRole(session.user.role);
  const user = {
    name: session.user.name ?? "There",
    email: session.user.email,
    image: session.user.image ?? null,
  };

  return (
    <SidebarProvider className="dark" style={sidebarStyle}>
      <DashboardSidebar role={role} user={user} />
      <SidebarInset>
        <Topbar user={user} />
        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </SidebarInset>
      <Fab role={role} />
    </SidebarProvider>
  );
}
