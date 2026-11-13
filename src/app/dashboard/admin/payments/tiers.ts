import type { Filter } from "mongodb";
import type { TransactionDoc } from "@/lib/db";

export type PlanTier = "enterprise" | "pro" | "starter";

/** Bucket a plan name ("Enterprise Monthly", "Professional Annual"…) into a tier. */
export function planTier(plan: string): PlanTier {
  const value = plan.toLowerCase();
  if (value.startsWith("enterprise")) return "enterprise";
  if (value.startsWith("pro")) return "pro";
  return "starter";
}

/** Regexes matching each tier's plan names. */
export const TIER_PLAN_MATCH: Record<PlanTier, { $regex: string; $options: string }> = {
  enterprise: { $regex: "^enterprise", $options: "i" },
  pro: { $regex: "^pro", $options: "i" },
  starter: { $regex: "^(?!enterprise|^pro)", $options: "i" },
};

/** Optional status filter shared by the payments page and CSV export. */
export function buildTxnFilter(status: string): Filter<TransactionDoc> {
  if (["success", "pending", "failed"].includes(status)) {
    return { status: status as TransactionDoc["status"] };
  }
  return {};
}
