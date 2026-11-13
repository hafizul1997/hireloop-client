import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Get Started — HireLoop",
  description:
    "Create a HireLoop account as an employee, employer, or admin and take your next step.",
};

const SignUpPage = () => {
  return <SignUpForm />;
};

export default SignUpPage;
