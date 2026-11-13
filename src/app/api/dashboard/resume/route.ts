import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { profiles } from "@/lib/db";

/**
 * Resume upload (POST) and download (GET) for the signed-in user, any role.
 * Route handler instead of a server action because resumes are up to 2MB —
 * over the 1MB server-action body cap.
 */

const MAX_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

/** Download the caller's stored resume as an attachment. */
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const profile = await profiles.findOne(
    { userId: session.user.id },
    { projection: { resume: 1 } },
  );
  if (!profile?.resume) {
    return new Response("Not found", { status: 404 });
  }

  const bytes = Buffer.from(profile.resume.data, "base64");
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": profile.resume.contentType,
      "Content-Length": String(bytes.length),
      "Content-Disposition": `attachment; filename="${profile.resume.fileName.replaceAll('"', "")}"`,
    },
  });
}

/** Replace (or set) the caller's resume from a multipart form `file` field. */
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const file = (await request.formData()).get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No file provided." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return Response.json(
      { error: "Only PDF, DOC, or DOCX files are accepted." },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return Response.json(
      { error: "File is too large — the limit is 2MB." },
      { status: 400 },
    );
  }

  const data = Buffer.from(await file.arrayBuffer()).toString("base64");
  await profiles.updateOne(
    { userId: session.user.id },
    {
      $set: {
        userId: session.user.id,
        updatedAt: new Date(),
        resume: {
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type,
          data,
          uploadedAt: new Date(),
        },
      },
    },
    { upsert: true },
  );

  return Response.json({ ok: true });
}
