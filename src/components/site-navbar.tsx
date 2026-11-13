import Link from "next/link";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { auth } from "@/lib/auth";
import { getRoleHome } from "@/lib/role-redirect";

const navLinks = [
  { label: "Browse Jobs", href: "/jobs" },
  { label: "Company", href: "/company" },
  { label: "Pricing", href: "/pricing" },
];

/** Public navbar — swaps Sign In / Get Started for a Dashboard link when logged in. */
export async function SiteNavbar() {
  const session = await auth.api.getSession({ headers: await headers() });
  const dashboardHref = getRoleHome(session?.user.role);

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

          {session ? (
            <Button
              nativeButton={false}
              variant="secondary"
              size="lg"
              className="rounded-full bg-white px-4 font-semibold text-zinc-900 hover:bg-zinc-200"
              render={<Link href={dashboardHref} />}
            >
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-md px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
              >
                Sign In
              </Link>

              <Button
                nativeButton={false}
                variant="secondary"
                size="lg"
                className="rounded-full bg-white px-4 font-semibold text-zinc-900 hover:bg-zinc-200"
                render={<Link href="/sign-up" />}
              >
                Get Started
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
