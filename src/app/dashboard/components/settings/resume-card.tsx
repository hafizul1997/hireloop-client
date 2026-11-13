"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { FileText, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { removeResume } from "@/app/dashboard/settings/actions";
import { timeAgo } from "@/lib/format";

/** Plain, RSC-serializable resume metadata (stripped of the Mongo doc). */
type ResumeMeta = {
  fileName: string;
  fileSize: number;
  /** ISO string of the upload time. */
  uploadedAt: string;
};

const MAX_RESUME_BYTES = 2 * 1024 * 1024; // 2MB
const ACCEPT =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * Resume card — upload/replace goes through the /api/dashboard/resume route
 * handler (files exceed the server-action body cap); remove is a server
 * action. Works for any signed-in role.
 */
export function ResumeCard({ resume }: { resume: ResumeMeta | null }) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > MAX_RESUME_BYTES) {
      toast.error("File is too large — the limit is 2MB.");
      return;
    }

    setPending(true);
    const body = new FormData();
    body.set("file", file);
    const response = await fetch("/api/dashboard/resume", {
      method: "POST",
      body,
    });
    setPending(false);

    if (!response.ok) {
      const { error } = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      toast.error(error ?? "Could not upload resume.");
      return;
    }

    toast.success("Resume uploaded.");
    router.refresh();
  }

  async function remove() {
    setPending(true);
    await removeResume();
    setPending(false);
    toast.success("Resume removed.");
    router.refresh();
  }

  return (
    <div className="h-fit rounded-2xl border border-white/5 bg-[#141414] p-6">
      <h2 className="text-sm font-semibold">Resume</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Upload your most recent resume to enable one-click applications.
      </p>

      {resume ? (
        <div className="mt-5 rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-5 text-center">
          <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-white/5">
            <FileText className="size-4 text-zinc-300" aria-hidden="true" />
          </span>
          <p className="mt-2.5 truncate text-sm font-medium" title={resume.fileName}>
            {resume.fileName}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">
            Last updated {timeAgo(new Date(resume.uploadedAt))} · {formatSize(resume.fileSize)}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={pending}
              onClick={() => fileInput.current?.click()}
            >
              Replace
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={pending}
              onClick={remove}
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => fileInput.current?.click()}
          className="mt-5 flex w-full flex-col items-center rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-6 text-center transition-colors hover:border-white/25 hover:bg-white/[0.06] disabled:pointer-events-none disabled:opacity-50"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-white/5">
            <Upload className="size-4 text-zinc-300" aria-hidden="true" />
          </span>
          <span className="mt-2.5 text-sm font-medium">
            {pending ? "Uploading…" : "Upload Resume"}
          </span>
          <span className="mt-0.5 text-xs text-zinc-500">
            PDF, DOC, or DOCX · max 2MB
          </span>
        </button>
      )}

      <input
        ref={fileInput}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={upload}
      />
    </div>
  );
}
