import type { Metadata } from "next";
import { requireRole } from "@/lib/guards";
import { PageHeader } from "../../components/job-card";
import { PlanCard } from "../../components/plan-card";

export const metadata: Metadata = {
  title: "Billing — HireLoop",
};

/** Employer billing — static plan values (highlighted) until payments land. */
export default async function EmployerBillingPage() {
  await requireRole("employer");

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader title="Billing" subtitle="Your current plan and usage." />

      <div className="mt-6">
        <PlanCard
          plan="Business Tier"
          price="$49"
          period="/ month"
          features={[
            "Unlimited active job posts",
            "Applicant pipeline tracking",
            "Applicant messaging",
            "Team seats",
          ]}
          note="Payments are coming soon — your plan is active and free until then. This price is a static placeholder."
        />
      </div>
    </div>
  );
}
