
import Link from "next/link";
import { Crosshair, MapPin, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const POPULAR_TAGS = [
  "Product Designer",
  "Web Developer",
  "Engineering",
  "Marketing",
  "Customer Support",
] as const;

const HERO_STATS = [
  { value: "50K", label: "Active Jobs" },
  { value: "12K", label: "Companies" },
  { value: "2M", label: "Job Seekers" },
  { value: "97%", label: "Satisfaction Rate" },
] as const;

const STARS = [
  { left: "8%", top: "12%", size: 2, opacity: 0.5 },
  { left: "18%", top: "38%", size: 2, opacity: 0.35 },
  { left: "30%", top: "8%", size: 3, opacity: 0.6 },
  { left: "42%", top: "22%", size: 2, opacity: 0.4 },
  { left: "55%", top: "10%", size: 2, opacity: 0.5 },
  { left: "68%", top: "30%", size: 3, opacity: 0.45 },
  { left: "78%", top: "14%", size: 2, opacity: 0.6 },
  { left: "90%", top: "26%", size: 2, opacity: 0.4 },
  { left: "12%", top: "58%", size: 2, opacity: 0.25 },
  { left: "85%", top: "52%", size: 2, opacity: 0.3 },
] as const;

function HeroBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {STARS.map((star, index) => (
        <span
          key={index}
          className="absolute rounded-full bg-white"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
          }}
        />
      ))}

      {/* Planet */}
      <div className="absolute left-1/2 top-[62%] size-176 max-w-none -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_28%_18%,#8b7cf7_0%,#4c3a9e_28%,#221a4a_55%,#100c22_78%)] shadow-[0_0_120px_30px_rgba(91,108,245,0.35),inset_0_2px_0_0_rgba(255,255,255,0.25)]" />

      {/* Atmosphere glow */}
      <div className="absolute left-1/2 top-[62%] size-240 max-w-none -translate-x-1/2 rounded-full bg-[#5b6cf5] opacity-25 blur-[140px]" />

      {/* Fade into stats bar */}
      <div className="absolute inset-x-0 bottom-0 h-72 bg-linear-to-t from-[#0b0714] via-[#0b0714]/70 to-transparent" />
    </div>
  );
}

function HeroBadge() {
  return (
    <Link
      href="/pricing"
      className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium tracking-wide text-zinc-300 uppercase backdrop-blur transition-colors hover:bg-white/10"
    >
      <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
        New
      </span>
      Hireloop 2.0 — 2M+ job seekers trust Hireloop
    </Link>
  );
}

function JobSearchForm() {
  return (
    <form
      action="/jobs"
      method="get"
      role="search"
      className="flex w-full max-w-2xl flex-col gap-2 rounded-3xl border border-white/10 bg-white/5 p-2 backdrop-blur sm:flex-row sm:items-center sm:rounded-full"
    >
      <label className="flex flex-1 items-center gap-2 px-3 py-2">
        <SearchIcon
          className="size-4 shrink-0 text-zinc-400"
          aria-hidden="true"
        />

        <span className="sr-only">
          Job title, keyword or company
        </span>

        <input
          type="search"
          name="q"
          placeholder="Job title, keyword or company"
          className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
        />
      </label>

      <span
        aria-hidden="true"
        className="hidden h-6 w-px bg-white/10 sm:block"
      />

      <label className="flex items-center gap-2 px-3 py-2">
        <MapPin
          className="size-4 shrink-0 text-zinc-400"
          aria-hidden="true"
        />

        <span className="sr-only">Location</span>

        <select
          name="location"
          defaultValue=""
          className="appearance-none bg-transparent pr-1 text-sm text-zinc-400 focus:outline-none [&>option]:bg-[#0b0714] [&>option]:text-white"
        >
          <option value="">Location</option>
          <option value="Remote">Remote</option>
          <option value="New York, US">New York, US</option>
          <option value="London, UK">London, UK</option>
          <option value="Berlin, DE">Berlin, DE</option>
          <option value="Singapore, SG">Singapore, SG</option>
        </select>
      </label>

      <Button
        type="submit"
        nativeButton={true}
        size="icon-lg"
        aria-label="Search jobs"
        className="shrink-0 self-end rounded-full bg-[#5b6cf5] text-white hover:bg-[#4a5be0] sm:self-auto"
      >
        <SearchIcon aria-hidden="true" />
      </Button>
    </form>
  );
}

function PopularSearches() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-500">
      <span>Popular:</span>

      {POPULAR_TAGS.map((tag) => (
        <Link
          key={tag}
          href={`/jobs?q=${encodeURIComponent(tag)}`}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          {tag}
        </Link>
      ))}
    </div>
  );
}

function HeroStats() {
  return (
    <div className="relative border-t border-white/5 bg-white/2 backdrop-blur">
      <dl className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/5 md:grid-cols-4">
        {HERO_STATS.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center gap-1 px-4 py-8"
          >
            <dt className="order-2 text-xs text-zinc-400">
              {stat.label}
            </dt>

            <dd className="order-1 text-3xl font-bold tracking-tight text-white">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative bg-[#0b0714] text-white">
      <HeroBackdrop />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 pt-16 pb-32 text-center sm:px-6 sm:pt-24 sm:pb-40">
        <HeroBadge />

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Find Your Dream Job Today
        </h1>

        <p className="max-w-2xl text-sm text-pretty text-zinc-400 sm:text-base">
          Explore thousands of job opportunities from top companies. Whether
          you&apos;re a seasoned professional or just starting your career, find
          your perfect opportunity here and take your next step toward success.
        </p>

        <JobSearchForm />

        <PopularSearches />
      </div>

      <div className="relative flex flex-col items-center gap-2 px-4 pb-24 text-center">
        <Crosshair
          className="size-5 text-white/60"
          aria-hidden="true"
        />

        <p className="max-w-xs text-sm font-medium text-zinc-200">
          Assisting over 15,000 job seekers find their dream positions.
        </p>
      </div>

      <HeroStats />
    </section>
  );
}
