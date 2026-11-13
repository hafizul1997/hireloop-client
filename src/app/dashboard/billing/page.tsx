import type { Metadata } from "next";
import { Check, Download, Search } from "lucide-react";
import { requireRole } from "@/lib/guards";
import { cn } from "@/lib/utils";
import { transactions } from "@/lib/db";
import { EmptyState } from "../components/job-card";

export const metadata: Metadata = {
  title: "Billing — HireLoop",
};

const FEATURES = [
  "Unlimited Applications",
  "Premium Job Insights",
  "Priority Candidate Badge",
  "Direct Recruiter Messaging",
];

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const moneyCents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/** Seeker billing — plan card, demo payment method and the user's ledger. */
export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requireRole("employee");
  const { q = "" } = await searchParams;

  // Next billing date is a static placeholder (payments are not live yet).
  const nextBilling = new Date();
  nextBilling.setDate(nextBilling.getDate() + 30);

  const history = await transactions
    .find({ email: session.user.email })
    .sort({ createdAt: -1 })
    .toArray();

  const query = q.trim().toLowerCase();
  const filtered = query
    ? history.filter(
        (txn) =>
          txn.plan.toLowerCase().includes(query) ||
          txn.txnId.toLowerCase().includes(query),
      )
    : history;

  const cardHolder = (session.user.name ?? session.user.email)
    .split(" ")
    .slice(0, 2)
    .join(" ")
    .toUpperCase();

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* Search toolbar */}
      <form action="/dashboard/billing" className="w-full max-w-sm">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
            aria-hidden="true"
          />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search invoices or plans..."
            className="h-9 w-full rounded-lg border border-white/10 bg-[#141414] pl-9 pr-3 text-sm outline-none placeholder:text-zinc-500 focus:border-white/20"
          />
        </div>
      </form>

      {/* Header */}
      <div className="mt-6">
        <h1 className="text-2xl font-semibold">Subscription &amp; Billing</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage your professional tier features, recurring payments, and billing history.
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Current plan */}
        <div className="rounded-2xl border border-white/5 bg-[#141414] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-block rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-300">
                Current Plan
              </span>
              <h2 className="mt-3 text-2xl font-semibold">Professional Tier</h2>
            </div>
            <div className="text-right">
              <p className="text-3xl font-semibold tracking-tight">
                $29<span className="text-sm font-normal text-zinc-500">/mo</span>
              </p>
              <p className="mt-1 text-[11px] text-zinc-500">
                Next billing date: {dateFmt.format(nextBilling)}
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm text-zinc-500">
            Unlock global job insights and unlimited applications.
          </p>

          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2.5 text-sm text-zinc-300">
                <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-400/15">
                  <Check className="size-3 text-emerald-400" aria-hidden="true" />
                </span>
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex gap-2">
            <button
              type="button"
              className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
            >
              Upgrade Plan
            </button>
            <button
              type="button"
              className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              Manage Plan
            </button>
          </div>
          <p className="mt-4 text-[11px] text-zinc-600">
            Payments are not live yet — the plan and price above are static placeholders.
          </p>
        </div>

        {/* Payment method */}
        <div className="rounded-2xl border border-white/5 bg-[#141414] p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Payment Method</h2>
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Secure by Stripe
            </span>
          </div>

          {/* Demo card visual — replaces itself with real Stripe data later */}
          <div className="mt-5 rounded-xl bg-gradient-to-br from-fuchsia-600 via-purple-700 to-indigo-950 p-5 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <span className="h-7 w-9 rounded-md bg-gradient-to-br from-amber-200 to-amber-400 opacity-90" />
              <span className="text-sm font-bold italic tracking-wide">VISA</span>
            </div>
            <p className="mt-5 text-lg tracking-[0.2em]">•••• •••• •••• 4242</p>
            <div className="mt-5 flex items-end justify-between text-[10px] uppercase tracking-wider text-white/70">
              <div>
                <p>Card Holder</p>
                <p className="mt-0.5 text-xs font-semibold tracking-normal text-white">
                  {cardHolder}
                </p>
              </div>
              <div className="text-right">
                <p>Expires</p>
                <p className="mt-0.5 text-xs font-semibold tracking-normal text-white">12/25</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="mt-5 w-full text-center text-sm text-zinc-400 transition-colors hover:text-white"
          >
            + Add New Payment Method
          </button>
        </div>
      </div>

      {/* Billing history */}
      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Billing History</h2>
          <a
            href="/api/dashboard/billing/export"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-white"
          >
            <Download className="size-4" aria-hidden="true" />
            Export CSV
          </a>
        </div>

        <div className="mt-4 rounded-2xl border border-white/5 bg-[#141414]">
          {filtered.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title={history.length === 0 ? "No payments yet" : "No invoices match this search"}
                description={
                  history.length === 0
                    ? "Your plan is active and free until real payments land."
                    : "Try a different plan name or transaction ID."
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-wider text-zinc-500">
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Plan</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Transaction ID</th>
                    <th className="px-5 py-3 text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((txn) => (
                    <tr
                      key={txn.txnId}
                      className="border-b border-white/5 last:border-b-0 transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-3.5 text-zinc-300">
                        {dateFmt.format(txn.createdAt)}
                      </td>
                      <td className="px-5 py-3.5 text-zinc-400">{txn.plan}</td>
                      <td className="px-5 py-3.5 font-medium">
                        {moneyCents.format(txn.amount)}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-zinc-400">
                        {txn.txnId}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="flex justify-end">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium",
                              txn.status === "failed"
                                ? "bg-red-400/10 text-red-400"
                                : txn.status === "pending"
                                  ? "bg-amber-400/10 text-amber-400"
                                  : "bg-emerald-400/10 text-emerald-400",
                            )}
                          >
                            <span className="size-1.5 rounded-full bg-current" />
                            {txn.status === "failed"
                              ? "Failed"
                              : txn.status === "pending"
                                ? "Pending"
                                : "Paid"}
                          </span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Support card */}
      <section className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/5 bg-[#141414] p-6">
        <div>
          <h2 className="font-semibold">Need help with your invoice?</h2>
          <p className="mt-1 max-w-md text-sm text-zinc-500">
            Our support team is available 24/7 to help you resolve any payment issues or
            clarify billing details.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="mailto:support@hireloop.dev"
            className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-black transition-colors hover:bg-zinc-200"
          >
            Contact Support
          </a>
          <button
            type="button"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            Read Refund Policy
          </button>
        </div>
      </section>

      {/* Footer row */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-4 text-xs text-zinc-600">
        <p>© {new Date().getFullYear()} HireLoop Inc. All rights reserved.</p>
        <div className="flex gap-4">
          <span>Terms of Service</span>
          <span>Privacy Policy</span>
        </div>
      </div>
    </div>
  );
}
