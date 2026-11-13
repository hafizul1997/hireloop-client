"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Logo } from "@/components/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { getDashboardData, getNavItems } from "../data";

type DashboardSidebarProps = {
  role: string;
  user: { name: string; email: string; image?: string | null };
};

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** shadcn sidebar: logo, role user-card, per-role nav, CTA and logout. */
export function DashboardSidebar({ role, user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const { roleLabel, settingsHref, cta } = getDashboardData(role);
  const navItems = getNavItems(role);

  function closeMobile() {
    setOpenMobile(false);
  }

  async function signOut() {
    const { error } = await authClient.signOut();

    if (error) {
      toast.error(error.message ?? "Could not sign out.");
      return;
    }

    toast.success("Signed out. See you soon!");
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex h-8 items-center px-2 group-data-[collapsible=icon]:hidden">
          <Logo />
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip={user.name}>
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt=""
                  className="size-8 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#5b6cf5] to-[#22d3ee] text-xs font-semibold">
                  {initials(user.name)}
                </span>
              )}
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs text-zinc-500">
                  {roleLabel}
                </span>
              </span>
            </SidebarMenuButton>
            <Link
              href={settingsHref}
              onClick={closeMobile}
              className="mt-1 inline-flex rounded-full bg-[#5b6cf5]/20 px-2.5 py-1 text-[11px] font-medium text-[#8b9bff] transition-colors hover:bg-[#5b6cf5]/30 group-data-[collapsible=icon]:hidden"
            >
              Prepare account
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.label}
                      render={
                        <Link
                          href={item.href}
                          onClick={closeMobile}
                          aria-current={active ? "page" : undefined}
                        />
                      }
                    >
                      <Icon aria-hidden="true" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="group-data-[collapsible=icon]:hidden">
          <Link
            href={cta.href}
            onClick={closeMobile}
            className="block rounded-full bg-white py-2 text-center text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
          >
            {cta.label}
          </Link>
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Logout" onClick={signOut}>
              <LogOut aria-hidden="true" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
