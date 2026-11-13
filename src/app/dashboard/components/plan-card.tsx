import { Check } from "lucide-react";

type PlanCardProps = {
  plan: string;
  price: string;
  period?: string;
  features: string[];
  note: string;
};

/**
 * Static billing display — the plan values are fixed (highlighted in amber)
 * until a payment provider is integrated.
 */
export function PlanCard({ plan, price, period, features, note }: PlanCardProps) {
  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-white/5 bg-[#141414] p-6">
      <p className="text-sm font-medium uppercase tracking-wide text-amber-400">
        {plan}
      </p>
      <p className="mt-3 text-4xl font-semibold tracking-tight">
        <span className="text-amber-400">{price}</span>
        {period ? <span className="text-base text-zinc-500"> {period}</span> : null}
      </p>

      <ul className="mt-6 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2.5 text-sm text-zinc-300">
            <Check className="size-4 shrink-0 text-emerald-400" aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>

      <p className="mt-6 border-t border-white/5 pt-4 text-xs text-zinc-500">{note}</p>
    </div>
  );
}
