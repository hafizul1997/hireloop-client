"use client";

import { useRouter, useSearchParams } from "next/navigation";

/** Checkbox rows for the "Job Type" filter group — pushes ?type= on change. */
export function JobTypeFilters({
  types,
  counts,
}: {
  types: string[];
  /** Live count per type (open jobs matching the current search). */
  counts: Record<string, number>;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const selected = new Set((params.get("type") ?? "").split(",").filter(Boolean));

  function toggle(type: string) {
    const next = new Set(selected);
    if (next.has(type)) next.delete(type);
    else next.add(type);

    const query = new URLSearchParams(params);
    if (next.size) query.set("type", [...next].join(","));
    else query.delete("type");
    query.delete("page"); // filters reset pagination
    router.push(`/jobs${query.size ? `?${query}` : ""}`);
  }

  return (
    <div className="space-y-1">
      {types.map((type) => (
        <label
          key={type}
          className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-zinc-50"
        >
          <span className="flex items-center gap-2 text-zinc-700">
            <input
              type="checkbox"
              checked={selected.has(type)}
              onChange={() => toggle(type)}
              className="size-4 rounded accent-[#5b6cf5]"
            />
            {type}
          </span>
          <span className="text-xs text-zinc-400">{counts[type] ?? 0}</span>
        </label>
      ))}
    </div>
  );
}

/** "Sort by" dropdown — pushes ?sort= on change. */
export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const params = useSearchParams();

  function change(sort: string) {
    const query = new URLSearchParams(params);
    if (sort === "recent") query.delete("sort");
    else query.set("sort", sort);
    query.delete("page"); // sorting resets pagination
    router.push(`/jobs${query.size ? `?${query}` : ""}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm text-zinc-500">
      Sort by:
      <select
        value={value}
        onChange={(event) => change(event.target.value)}
        className="h-9 rounded-lg border border-zinc-200 bg-white px-2 text-sm text-zinc-800 outline-none focus:border-[#5b6cf5]"
      >
        <option value="recent">Most Recent</option>
        <option value="oldest">Oldest</option>
      </select>
    </label>
  );
}
