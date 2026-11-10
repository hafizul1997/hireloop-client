"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return <Sonner theme="dark" position="bottom-right" richColors {...props} />;
};

export { Toaster };
