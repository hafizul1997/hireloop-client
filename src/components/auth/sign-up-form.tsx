
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Eye,
  EyeOff,
  Loader2,
  User,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell } from "@/components/auth/auth-shell";

const ROLES = [
  {
    value: "employee",
    label: "Employee",
    description: "Find jobs and apply",
    icon: User,
  },
  {
    value: "employer",
    label: "Employer",
    description: "Post jobs and hire talent",
    icon: Building2,
  },
] as const;

type Role = (typeof ROLES)[number]["value"];

export function SignUpForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("employee");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setPending(true);

    try {
      const { error: signUpError } = await authClient.signUp.email({
        name,
        email,
        password,
        role,
      });

      if (signUpError) {
        setError(
          signUpError.message ??
            "Something went wrong. Please try again."
        );
        setPending(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Unable to create your account. Please try again.");
      setPending(false);
    }
  }

  async function onGoogle() {
    setError(null);
    setPending(true);

    try {
      const { error: socialError } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });

      if (socialError) {
        setError(
          socialError.message ?? "Could not start Google sign in."
        );
        setPending(false);
      }
    } catch {
      setError("Google sign up failed. Please try again.");
      setPending(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      description="Join HireLoop — get hired, hire talent, or run the platform."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-[#8b97f8] transition-colors hover:text-white"
          >
            Sign in
          </Link>
        </>
      }
    >
      <Button
        type="button"
        nativeButton={true}
        onClick={onGoogle}
        disabled={pending}
        className="h-11 w-full rounded-xl border border-white/10 bg-white text-sm font-medium text-zinc-900 hover:bg-zinc-200"
      >
        Continue with Google
      </Button>

      <div className="my-6 flex items-center gap-3 text-xs text-zinc-500">
        <span className="h-px flex-1 bg-white/10" />
        or sign up with email
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
          >
            {error}
          </p>
        )}

        {/* Role Selection */}
        <div
          role="radiogroup"
          aria-label="I am joining as"
          className="grid grid-cols-2 gap-3"
        >
          {ROLES.map(({ value, label, description, icon: Icon }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={role === value}
              onClick={() => setRole(value)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors ${
                role === value
                  ? "border-[#8b97f8] bg-[#8b97f8]/10 text-white"
                  : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/30"
              }`}
            >
              <Icon className="h-6 w-6" />

              <span className="text-sm font-semibold">
                {label}
              </span>

              <span className="text-xs">
                {description}
              </span>
            </button>
          ))}
        </div>

        {/* Full Name */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-white">
            Full name
          </span>

          <Input
            type="text"
            name="name"
            autoComplete="name"
            required
            placeholder="Jane Doe"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>

        {/* Email */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-white">
            Email
          </span>

          <Input
            type="email"
            name="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        {/* Password */}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-white">
            Password
          </span>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="pr-11"
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={
                showPassword ? "Hide password" : "Show password"
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </label>

        {/* Submit */}
        <Button
          type="submit"
          nativeButton={true}
          size="lg"
          disabled={pending}
          className="h-11 w-full rounded-xl"
        >
          {pending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}

          {pending ? "Creating account..." : "Create Account"}
        </Button>
      </form>
    </AuthShell>
  );
}
