"use client";

import { useRouter, useSearchParams } from "next/navigation";

/** Role dropdown in the page header — re-navigates on change, keeping ?q=. */
export function RoleFilter({ value }: { value: string }) {
  const router = useRouter();
  const params = useSearchParams();

  return (
    <select
      aria-label="Filter by role"
      value={value}
      onChange={(event) => {
        const next = new URLSearchParams(params);
        if (event.target.value) next.set("role", event.target.value);
        else next.delete("role");
        router.push(`/dashboard/admin/users?${next.toString()}`);
      }}
      className="h-9 rounded-full border border-white/10 bg-[#141414] px-3 text-sm text-zinc-300 outline-none transition-colors hover:bg-white/5 focus:border-white/20"
    >
      <option value="">All Roles</option>
      <option value="employee">Seeker</option>
      <option value="employer">Recruiter</option>
      <option value="admin">Admin</option>
    </select>
  );
}

// ConfirmSubmit moved to @/app/dashboard/components/confirm-submit.tsx.
