import Link from "next/link";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Browse Jobs", href: "/jobs" },
  { label: "Company", href: "/company" },
  { label: "Pricing", href: "/pricing" },
];

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center text-xl font-bold tracking-tight"
      aria-label="HireLoop home"
    >
      <span className="text-[#5b6cf5]">hire</span>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        aria-hidden="true"
        className="mx-0.5 size-5 text-[#22d3ee]"
      >
        <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z" />
      </svg>
      <span className="text-[#f97316]">loop</span>
    </Link>
  );
}

export function SiteNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0b0714]">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />

        <nav className="flex items-center gap-2 sm:gap-4">
          <ul className="hidden items-center gap-1 sm:flex">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="rounded-md px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <span
            aria-hidden="true"
            className="mx-2 hidden h-5 w-px bg-white/15 sm:block"
          />

          <Link
            href="/sign-in"
            className="rounded-md px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            Sign In
          </Link>

          <Button
            variant="secondary"
            size="lg"
            className="rounded-full bg-white px-4 font-semibold text-zinc-900 hover:bg-zinc-200"
            render={<Link href="/sign-up" />}
          >
            Get Started
          </Button>
        </nav>
      </div>
    </header>
  );
}
