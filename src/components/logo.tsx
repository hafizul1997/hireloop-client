import Link from "next/link";

export function Logo() {
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
