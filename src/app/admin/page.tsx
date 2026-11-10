import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Briefcase, ShieldCheck, Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { getRoleHome } from "@/lib/role-redirect";
import { SignOutButton } from "@/components/sign-out-button";

export const metadata: Metadata = {
  title: "Admin Dashboard — HireLoop",
  description: "Manage the HireLoop platform, users, and job listings.",
};

const AdminDashboardPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  if (session.user.role !== "admin") {
    redirect(getRoleHome(session.user.role));
  }

  return (
    <main className="relative flex flex-1 flex-col items-center overflow-hidden bg-[#0b0714] px-4 py-16 text-white sm:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-[-40%] size-160 max-w-none -translate-x-1/2 rounded-full bg-[#5b6cf5] opacity-15 blur-[140px]" />
      </div>

      <div className="relative w-full max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-[#5b6cf5]/15 text-[#8b97f8]">
              <ShieldCheck className="size-6" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Admin Dashboard
              </h1>
              <p className="text-sm text-zinc-400">
                Signed in as {session.user.name} · {session.user.email}
              </p>
            </div>
          </div>

          <SignOutButton />
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:p-8">
          <p className="text-sm font-medium uppercase tracking-wide text-[#8b97f8]">
            Coming soon
          </p>
          <h2 className="mt-2 text-xl font-semibold">
            Platform management is on the way
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Moderate users, review job listings, and monitor platform activity
            from here.
          </p>

          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            <li className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
              <Users className="size-4 shrink-0 text-[#8b97f8]" aria-hidden="true" />
              Manage users
            </li>
            <li className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
              <Briefcase className="size-4 shrink-0 text-[#8b97f8]" aria-hidden="true" />
              Moderate jobs
            </li>
            <li className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
              <ShieldCheck className="size-4 shrink-0 text-[#8b97f8]" aria-hidden="true" />
              Platform settings
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
};

export default AdminDashboardPage;
