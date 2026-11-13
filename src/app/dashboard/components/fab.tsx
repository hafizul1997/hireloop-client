"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { getDashboardData } from "../data";

/** Floating action button (bottom-right) — links to the role's quick action. */
export function Fab({ role }: { role: string }) {
  const { cta } = getDashboardData(role);

  return (
    <Link
      href={cta.href}
      aria-label={cta.label}
      title={cta.label}
      className="fixed bottom-6 right-6 z-30 flex size-12 items-center justify-center rounded-full bg-white text-black shadow-lg shadow-black/50 transition-colors hover:bg-zinc-200"
    >
      <Plus className="size-5" aria-hidden="true" />
    </Link>
  );
}
