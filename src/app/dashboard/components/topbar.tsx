"use client";

import Link from "next/link";
import { Bell, Home, Mail, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

type TopbarProps = {
  user: { name: string; email: string };
};

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Dashboard tool bar under the main navbar: sidebar toggle, search, notifications. */
export function Topbar({ user }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-white/5 bg-[#0a0a0a]/80 px-4 py-3 backdrop-blur sm:px-6">
      <SidebarTrigger className="text-zinc-400 hover:text-white" />

      <Link
        href="/"
        aria-label="Back to homepage"
        title="Back to homepage"
        className="flex size-9 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
      >
        <Home className="size-5" aria-hidden="true" />
      </Link>

      <div className="relative w-full max-w-md">
        <Search
          className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Search for opportunities..."
          className="h-9 w-full rounded-full border border-white/5 bg-[#141414] pl-10 pr-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-white/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Messages"
          className="flex size-9 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <Mail className="size-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex size-9 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <Bell className="size-5" aria-hidden="true" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-[#f97316]" />
        </button>
        <span
          title={`${user.name} (${user.email})`}
          className="ml-1 flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-[#5b6cf5] to-[#22d3ee] text-xs font-semibold"
        >
          {initials(user.name)}
        </span>
      </div>
    </header>
  );
}
