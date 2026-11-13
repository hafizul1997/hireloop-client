import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { transactions } from "@/lib/db";

/** CSV export of the signed-in seeker's own billing history. */
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const mine = await transactions
    .find({ email: session.user.email })
    .sort({ createdAt: -1 })
    .limit(1000)
    .toArray();

  // Quote every field so commas inside values stay safe.
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
  const header = "Date,Plan,Amount,Status,Transaction ID";
  const rows = mine.map((txn) =>
    [
      txn.createdAt.toISOString(),
      txn.plan,
      txn.amount.toFixed(2),
      txn.status,
      txn.txnId,
    ]
      .map(escape)
      .join(","),
  );

  return new Response([header, ...rows].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="billing-history.csv"',
    },
  });
}
