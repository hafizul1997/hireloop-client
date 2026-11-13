"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SELECT_CLASS =
  "h-9 rounded-lg border border-white/10 bg-[#141414] px-3 text-sm text-zinc-300 outline-none transition-colors hover:bg-white/5 focus:border-white/20";

/** Shared param-aware navigation: keeps every other query param intact. */
function useSetParam() {
  const router = useRouter();
  const params = useSearchParams();

  return (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/dashboard/admin/jobs?${next.toString()}`);
  };
}

/** Status dropdown: All Statuses / Open / Closed. */
export function StatusFilter({ value }: { value: string }) {
  const setParam = useSetParam();

  return (
    <select
      aria-label="Filter by status"
      value={value}
      onChange={(event) => setParam("status", event.target.value)}
      className={SELECT_CLASS}
    >
      <option value="">All Statuses</option>
      <option value="open">Open</option>
      <option value="closed">Closed</option>
    </select>
  );
}

/** Category dropdown, options computed live from the job listings. */
export function CategoryFilter({
  value,
  categories,
}: {
  value: string;
  categories: string[];
}) {
  const setParam = useSetParam();

  return (
    <select
      aria-label="Filter by category"
      value={value}
      onChange={(event) => setParam("cat", event.target.value)}
      className={SELECT_CLASS}
    >
      <option value="">All Categories</option>
      {categories.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>
  );
}
