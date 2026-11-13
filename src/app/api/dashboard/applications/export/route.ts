import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { applications } from "@/lib/db";
import { statusLabel } from "@/lib/format";

/** CSV export of the signed-in seeker's own applications. */
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const mine = await applications
    .find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(1000)
    .toArray();

  // Quote every field so commas inside values stay safe.
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
  const header = "Job Title,Status,Applied,Last Update";
  const rows = mine.map((application) =>
    [
      application.jobTitle,
      statusLabel(application.status),
      application.createdAt.toISOString(),
      application.updatedAt.toISOString(),
    ]
      .map(escape)
      .join(","),
  );

  return new Response([header, ...rows].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="my-applications.csv"',
    },
  });
}
