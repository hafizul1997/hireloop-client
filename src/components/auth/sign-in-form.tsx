"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { getRoleHome } from "@/lib/role-redirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthShell } from "@/components/auth/auth-shell";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const { data, error: signInError } = await authClient.signIn.email({
      email,
      password,
    });

    if (signInError) {
      toast.error(signInError.message ?? "Invalid email or password.");
      setPending(false);
      return;
    }

    toast.success(`Welcome back${data?.user.name ? `, ${data.user.name.split(" ")[0]}` : ""}!`);
    router.push(getRoleHome(data?.user.role));
    router.refresh();
  }

  async function onGoogle() {
    setPending(true);

    const { error: socialError } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/auth/redirect",
    });

    if (socialError) {
      toast.error(socialError.message ?? "Could not start Google sign in.");
      setPending(false);
    }
    // On success the browser navigates to Google, so keep the pending state.
  }

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue your job search or find your next hire."
      footer={
        <>
          New to HireLoop?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-[#8b97f8] transition-colors hover:text-white"
          >
            Create an account
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
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-4"
          fill="currentColor"
        >
          <path
            fill="#EA4335"
            d="M12 5.04c1.62 0 3.06.56 4.2 1.64l3.12-3.12C17.46 1.8 14.96.75 12 .75 7.62.75 3.84 3.27 2.04 6.96l3.66 2.84C6.55 7.02 9.03 5.04 12 5.04z"
          />
          <path
            fill="#4285F4"
            d="M23.25 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.68 2.85c2.15-1.99 3.5-4.92 3.5-8.67z"
          />
          <path
            fill="#FBBC05"
            d="M5.7 14.21a7.04 7.04 0 0 1 0-4.42L2.04 6.96a11.26 11.26 0 0 0 0 10.09l3.66-2.84z"
          />
          <path
            fill="#34A853"
            d="M12 23.25c2.96 0 5.46-.98 7.28-2.66l-3.68-2.85c-1.02.68-2.35 1.09-3.6 1.09-2.97 0-5.45-1.98-6.3-4.63l-3.66 2.84c1.8 3.68 5.58 6.21 9.96 6.21z"
          />
        </svg>
        Continue with Google
      </Button>

      <div className="my-6 flex items-center gap-3 text-xs text-zinc-500">
        <span className="h-px flex-1 bg-white/10" />
        or continue with email
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-zinc-300">Email</span>
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

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-zinc-300">Password</span>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-white"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </label>

        <Button
          type="submit"
          nativeButton={true}
          size="lg"
          disabled={pending}
          className="mt-1 h-11 w-full rounded-xl bg-[#5b6cf5] text-sm font-semibold text-white hover:bg-[#4a5be0]"
        >
          {pending ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : null}
          {pending ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </AuthShell>
  );
}
