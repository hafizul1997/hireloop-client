"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { getRoleHome } from "@/lib/role-redirect";

/**
 * Landing spot after Google OAuth — reads the fresh session and sends the
 * user to the dashboard for their role.
 */
const AuthRedirectPage = () => {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.replace("/sign-in");
      return;
    }

    router.replace(getRoleHome(session.user.role));
    router.refresh();
  }, [isPending, session, router]);

  return (
    <main className="flex flex-1 items-center justify-center bg-[#0b0714] py-24 text-white">
      <div className="flex flex-col items-center gap-3">
        <Loader2
          className="size-6 animate-spin text-[#8b97f8]"
          aria-hidden="true"
        />
        <p className="text-sm text-zinc-400">Signing you in...</p>
      </div>
    </main>
  );
};

export default AuthRedirectPage;
