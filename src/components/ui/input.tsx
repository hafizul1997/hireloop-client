import type { ComponentProps } from "react";
import { cn } from "cn";

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm text-white transition-all outline-none select-none placeholder:text-zinc-500 focus-visible:border-[#5b6cf5]/60 focus-visible:ring-3 focus-visible:ring-[#5b6cf5]/25 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
