import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

/** Shared placeholder for dashboard sections that are not built yet. */
export function ComingSoon({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center rounded-3xl border border-white/5 bg-[#141414] px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-white/5 text-amber-400">
        <Sparkles className="size-5" aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-lg font-semibold capitalize">{children}</h1>
      <p className="mt-2 text-sm text-zinc-500">
        This section is under construction — check back soon!
      </p>
    </div>
  );
}
