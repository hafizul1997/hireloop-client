"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveProfessionalDetails } from "@/app/dashboard/settings/actions";

const inputClass =
  "border-white/10 bg-white/5 text-white placeholder:text-zinc-600";
const textareaClass =
  "w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 [color-scheme:dark]";

/**
 * Professional Details card — headline, bio and a chip-based skills editor.
 * Skills are kept as local state (add on Enter/comma, remove on ×) and sent
 * to the server action as a comma-separated list on save. Props are plain
 * values (the Mongo profile document can't cross the RSC boundary).
 */
export function ProfessionalDetails({
  headline: initialHeadline,
  bio: initialBio,
  skills: initialSkills,
}: {
  headline: string;
  bio: string;
  skills: string[];
}) {
  const router = useRouter();
  const [headline, setHeadline] = useState(initialHeadline);
  const [bio, setBio] = useState(initialBio);
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [skillDraft, setSkillDraft] = useState("");
  const [pending, setPending] = useState(false);

  function addSkill(raw: string) {
    const skill = raw.trim().replace(/,+$/, "");
    if (!skill) return;
    if (skills.includes(skill)) {
      setSkillDraft("");
      return;
    }
    if (skills.length >= 15) {
      toast.error("Up to 15 skills.");
      return;
    }
    setSkills((current) => [...current, skill]);
    setSkillDraft("");
  }

  function onSkillKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addSkill(skillDraft);
    } else if (event.key === "Backspace" && !skillDraft && skills.length) {
      setSkills((current) => current.slice(0, -1));
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    if (!headline.trim() && !bio.trim() && skills.length === 0) {
      toast.error("Add at least one detail before saving.");
      return;
    }

    setPending(true);
    const body = new FormData();
    body.set("headline", headline);
    body.set("bio", bio);
    body.set("skills", skills.join(","));
    await saveProfessionalDetails(body);
    setPending(false);

    toast.success("Details saved.");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-white/5 bg-[#141414] p-6"
    >
      <h2 className="text-sm font-semibold">Professional Details</h2>

      <div className="mt-5 space-y-1.5">
        <label htmlFor="headline" className="text-xs text-zinc-400">
          Professional Headline
        </label>
        <Input
          id="headline"
          value={headline}
          onChange={(event) => setHeadline(event.target.value)}
          placeholder="Senior UX/UI Designer"
          className={inputClass}
        />
      </div>

      <div className="mt-4 space-y-1.5">
        <label htmlFor="bio" className="text-xs text-zinc-400">
          Bio
        </label>
        <textarea
          id="bio"
          rows={4}
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          placeholder="Tell recruiters about your experience…"
          className={textareaClass}
        />
      </div>

      <div className="mt-4 space-y-1.5">
        <label htmlFor="skill" className="text-xs text-zinc-400">
          Skills
        </label>
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded-md bg-white/10 py-0.5 pr-1 pl-2 text-xs text-zinc-200"
            >
              {skill}
              <button
                type="button"
                aria-label={`Remove ${skill}`}
                onClick={() =>
                  setSkills((current) => current.filter((s) => s !== skill))
                }
                className="rounded-sm p-0.5 text-zinc-400 hover:text-white"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </span>
          ))}
          <input
            id="skill"
            value={skillDraft}
            onChange={(event) => setSkillDraft(event.target.value)}
            onKeyDown={onSkillKeyDown}
            onBlur={() => addSkill(skillDraft)}
            placeholder={skills.length ? "Add another…" : "Add a skill…"}
            className="min-w-24 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
          />
        </div>
        <p className="text-xs text-zinc-600">Press Enter or comma to add</p>
      </div>

      <div className="mt-5 border-t border-white/5 pt-4">
        <Button type="submit" size="sm" disabled={pending}>
          Save Details
        </Button>
      </div>
    </form>
  );
}
