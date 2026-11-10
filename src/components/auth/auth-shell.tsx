import type { ReactNode } from "react";
import { Logo } from "@/components/logo";

interface AuthShellProps {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthShell({
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-[#0b0714] px-4 py-14 text-white sm:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* Purple glow behind the card */}
        <div className="absolute left-1/2 top-[-40%] size-160 max-w-none -translate-x-1/2 rounded-full bg-[#5b6cf5] opacity-20 blur-[140px]" />

        {/* Fade into the page bottom */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-linear-to-t from-[#0b0714] to-transparent" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="mt-1.5 text-sm text-zinc-400">{description}</p>
          </div>

          {children}
        </div>

        <div className="mt-6 text-center text-sm text-zinc-400">{footer}</div>
      </div>
    </main>
  );
}
