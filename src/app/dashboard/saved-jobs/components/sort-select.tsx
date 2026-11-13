"use client";

import { useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  { value: "saved", label: "Recently Saved" },
  { value: "deadline", label: "Closing Soon" },
  { value: "oldest", label: "Oldest Saved" },
];

/** Sort dropdown for the saved jobs list — keeps every other query param. */
export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const params = useSearchParams();

  return (
    <label className="flex items-center gap-2 text-sm text-zinc-500">
      Sort by:
      <select
        aria-label="Sort saved jobs"
        value={value}
        onChange={(event) => {
          const next = new URLSearchParams(params);
          if (event.target.value === "saved") next.delete("sort");
          else next.set("sort", event.target.value);
          next.delete("page");
          router.push(`/dashboard/saved-jobs?${next.toString()}`);
        }}
        className="h-9 rounded-lg border border-white/10 bg-[#141414] px-3 text-sm text-zinc-300 outline-none transition-colors hover:bg-white/5 focus:border-white/20"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
