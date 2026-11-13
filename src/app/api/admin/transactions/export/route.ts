import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { transactions } from "@/lib/db";
import { buildTxnFilter } from "@/app/dashboard/admin/payments/tiers";

/** CSV export of the subscription ledger — honors the same ?status= filter. */
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  const status = request.nextUrl.searchParams.get("status") ?? "";

  const all = await transactions
    .find(buildTxnFilter(status))
    .sort({ createdAt: -1 })
    .limit(1000)
    .toArray();

  // Quote every field so commas inside values stay safe.
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
  const header = "Email,Plan,Amount,Status,Transaction ID,Date";
  const rows = all.map((txn) =>
    [
      txn.email,
      txn.plan,
      txn.amount.toFixed(2),
      txn.status,
      txn.txnId,
      txn.createdAt.toISOString(),
    ]
      .map(escape)
      .join(","),
  );

  return new Response([header, ...rows].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="hireloop-transactions.csv"',
    },
  });
}
