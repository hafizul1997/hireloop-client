"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { EllipsisVertical } from "lucide-react";

/**
 * Row kebab menu (⋮) — a controlled popover that closes on outside click
 * or Escape, keeping the items as normal links/forms inside.
 */
export function RowMenu({ label, children }: { label: string; children: ReactNode }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const details = detailsRef.current;
    if (!details) return;

    function onOutsideClick(event: MouseEvent) {
      if (details && !details.contains(event.target as Node)) {
        details.open = false;
      }
    }
    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && details) details.open = false;
    }
    function onToggle() {
      if (details?.open) {
        document.addEventListener("click", onOutsideClick);
        document.addEventListener("keydown", onEscape);
      } else {
        document.removeEventListener("click", onOutsideClick);
        document.removeEventListener("keydown", onEscape);
      }
    }

    details.addEventListener("toggle", onToggle);
    return () => {
      details.removeEventListener("toggle", onToggle);
      document.removeEventListener("click", onOutsideClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  return (
    <details ref={detailsRef} className="relative">
      <summary
        aria-label={label}
        className="flex size-8 cursor-pointer list-none items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/5 hover:text-white [&::-webkit-details-marker]:hidden"
      >
        <EllipsisVertical className="size-4" aria-hidden="true" />
      </summary>
      <div className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a] py-1 shadow-xl shadow-black/50">
        {children}
      </div>
    </details>
  );
}
