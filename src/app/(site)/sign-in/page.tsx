import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign In — HireLoop",
  description:
    "Sign in to your HireLoop account to find jobs or hire top talent.",
};

const SignInPage = () => {
  return <SignInForm />;
};

export default SignInPage;
