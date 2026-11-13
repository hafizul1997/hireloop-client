"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SELECT_CLASS =
  "h-8 rounded-lg border border-white/10 bg-[#141414] px-2.5 text-xs text-zinc-300 outline-none transition-colors hover:bg-white/5 focus:border-white/20";

/** Status dropdown in the transactions card header. */
export function TxnStatusFilter({ value }: { value: string }) {
  const router = useRouter();
  const params = useSearchParams();

  return (
    <select
      aria-label="Filter by status"
      value={value}
      onChange={(event) => {
        const next = new URLSearchParams(params);
        if (event.target.value) next.set("status", event.target.value);
        else next.delete("status");
        router.push(`/dashboard/admin/payments?${next.toString()}`);
      }}
      className={SELECT_CLASS}
    >
      <option value="">All Statuses</option>
      <option value="success">Success</option>
      <option value="pending">Pending</option>
      <option value="failed">Failed</option>
    </select>
  );
}
