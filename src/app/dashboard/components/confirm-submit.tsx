"use client";

import type { ReactNode } from "react";

/**
 * Submit button that asks for confirmation first — used for destructive
 * actions (Delete) inside server-action forms. Shared across roles.
 */
export function ConfirmSubmit({
  children,
  className,
  message,
}: {
  children: ReactNode;
  className?: string;
  message: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
