import type { ReactNode } from "react";
import { SiteNavbar } from "@/components/site-navbar";

/** Public site shell — renders the marketing navbar above every public page. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteNavbar />
      {children}
    </>
  );
}
