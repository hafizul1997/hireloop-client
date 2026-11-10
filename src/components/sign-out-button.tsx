"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();

  async function onClick() {
    const { error } = await authClient.signOut();

    if (error) {
      toast.error(error.message ?? "Could not sign out.");
      return;
    }

    toast.success("Signed out. See you soon!");
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <Button
      type="button"
      nativeButton={true}
      variant="ghost"
      onClick={onClick}
      className="rounded-full border border-white/10 bg-white/5 text-sm text-zinc-300 hover:bg-white/10 hover:text-white"
    >
      <LogOut aria-hidden="true" />
      Sign out
    </Button>
  );
}
