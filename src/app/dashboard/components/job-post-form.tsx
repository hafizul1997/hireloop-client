"use client";

import type { ReactNode } from "react";
import type { WithId } from "mongodb";
import { ArrowRight, Sparkle } from "lucide-react";
import type { Job } from "@/lib/db";
import { Input } from "@/components/ui/input";

const inputClass =
  "border-white/10 bg-white/5 text-white placeholder:text-zinc-600 [color-scheme:dark]";
const selectClass =
  "h-9 w-full rounded-lg border border-white/10 bg-white/5 px-2 text-sm text-white outline-none [color-scheme:dark]";
const textareaClass =
  "w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 [color-scheme:dark]";

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"] as const;

type JobPostFormProps = {
  /** Server action run on submit (`postJob`, `employerUpdateJob`, ...). */
  action: (formData: FormData) => Promise<void>;
  /** Present when editing an existing job post. */
  job?: WithId<Job> | null;
  submitLabel: string;
};

function Section({
  index,
  title,
  description,
  children,
}: {
  index: number;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#141414] p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <Sparkle className="size-3.5 text-[#5b6cf5]" aria-hidden="true" />
        {index}. {title}
      </h2>
      <p className="mt-1 text-xs text-zinc-500">{description}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-medium text-zinc-400">
        {label}
        {required ? <span className="text-red-400"> *</span> : null}
      </label>
      {children}
    </div>
  );
}

/**
 * Job Type as segmented pills — hidden radio inputs keep it a plain form
 * submission (no state, works without JS).
 */
function JobTypePills({ defaultValue }: { defaultValue: string }) {
  return (
    <div className="flex flex-wrap gap-2 sm:col-span-2">
      {JOB_TYPES.map((type) => (
        <label key={type} className="cursor-pointer">
          <input
            type="radio"
            name="employmentType"
            value={type}
            defaultChecked={type === defaultValue}
            className="peer sr-only"
          />
          <span className="inline-flex rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-400 transition-colors hover:border-white/25 peer-checked:border-[#5b6cf5] peer-checked:bg-[#5b6cf5]/15 peer-checked:text-white">
            {type}
          </span>
        </label>
      ))}
    </div>
  );
}

/**
 * The full job post editor — three numbered sections with descriptions,
 * segmented Job Type pills and the remote-work toggle. Used by employers
 * (post / update) and admins (moderate / update).
 */
export function JobPostForm({ action, job, submitLabel }: JobPostFormProps) {
  return (
    <form action={action} className="space-y-4">
      {job ? <input type="hidden" name="jobId" value={job._id.toString()} /> : null}

      <Section
        index={1}
        title="Basic Information"
        description="Company name and job title basics for the listing."
      >
        <Field label="Job Title" required>
          <Input
            name="title"
            required
            defaultValue={job?.title}
            placeholder="e.g. Senior Product Designer"
            className={inputClass}
          />
        </Field>
        <Field label="Company Name" required>
          <Input
            name="company"
            required
            defaultValue={job?.company}
            placeholder="e.g. TechFlow"
            className={inputClass}
          />
        </Field>
        <Field label="Job Category" required className="sm:col-span-2">
          <select
            name="category"
            required
            defaultValue={job?.category ?? "Engineering & Tech"}
            className={selectClass}
          >
            {[
              "Engineering & Tech",
              "Design",
              "Marketing",
              "Sales",
              "Operations",
              "Finance",
              "Human Resources",
              "Other",
            ].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </Field>
        <Field label="Job Type" required className="sm:col-span-2 -mb-1.5">
          <JobTypePills defaultValue={job?.type ?? "Full-time"} />
        </Field>
      </Section>

      <Section
        index={2}
        title="Location, Compensation & Timeline"
        description="Where the job is based, what it pays, and when applications close."
      >
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 sm:col-span-2">
          <div>
            <p className="text-sm text-zinc-200">
              Remote Work Allowed <span className="text-zinc-500">(Optional)</span>
            </p>
            <p className="text-xs text-zinc-500">
              Enables remote-friendly location selection.
            </p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              name="remoteFriendly"
              defaultChecked={job?.remoteFriendly}
              className="peer sr-only"
            />
            <span className="h-6 w-11 rounded-full bg-zinc-700 transition-colors peer-checked:bg-[#5b6cf5]" />
            <span className="absolute left-1 size-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
          </label>
        </div>

        <Field label="Job Location (Street / City)">
          <Input
            name="location"
            defaultValue={job?.location}
            placeholder="e.g. 221 Queen Street, Melbourne"
            className={inputClass}
          />
        </Field>
        <Field label="Application Deadline">
          <Input
            type="date"
            name="deadline"
            defaultValue={job?.deadline ? job.deadline.toISOString().slice(0, 10) : ""}
            className={inputClass}
          />
        </Field>
        <Field label="Min Salary">
          <Input
            name="salaryMin"
            defaultValue={job?.salaryMin}
            placeholder="$40k"
            className={inputClass}
          />
        </Field>
        <Field label="Max Salary">
          <Input
            name="salaryMax"
            defaultValue={job?.salaryMax}
            placeholder="$80k"
            className={inputClass}
          />
        </Field>
        <Field label="Frequency">
          <select
            name="salaryFrequency"
            defaultValue={job?.salaryFrequency ?? "Yearly"}
            className={selectClass}
          >
            {["Hourly", "Monthly", "Yearly"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </Field>
        <Field label="Work Mode" required>
          <select name="workMode" defaultValue={job?.workMode ?? "Onsite"} className={selectClass}>
            {["Onsite", "Remote", "Hybrid", "Field"].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </Field>
        <Field label="Job Industry">
          <Input
            name="industry"
            defaultValue={job?.industry}
            placeholder="e.g. Software"
            className={inputClass}
          />
        </Field>
      </Section>

      <Section
        index={3}
        title="Responsibilities & Required Skills"
        description="Describe the day-to-day work and what you're looking for."
      >
        <Field label="Responsibilities" className="sm:col-span-2">
          <textarea
            name="responsibilities"
            rows={4}
            defaultValue={job?.responsibilities}
            placeholder="Provide a clear description of the responsibilities the hire will handle, the tools they'll use, and the teams they'll collaborate with."
            className={textareaClass}
          />
        </Field>
        <Field label="Required Skills & Qualifications" className="sm:col-span-2">
          <textarea
            name="qualifications"
            rows={4}
            defaultValue={job?.qualifications}
            placeholder={"1. 2+ years of experience with Figma, Sketch or equivalent design tools\n2. 3+ years of experience in UX/UI design\n3. Deep understanding of design systems, prototyping and accessibility"}
            className={textareaClass}
          />
        </Field>
      </Section>

      <button
        type="submit"
        className="flex items-center gap-1.5 rounded-lg bg-[#5b6cf5] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4c5ce0]"
      >
        {submitLabel}
        <ArrowRight className="size-4" aria-hidden="true" />
      </button>
    </form>
  );
}
