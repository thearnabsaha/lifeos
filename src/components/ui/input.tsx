"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-2xl border border-zinc-900/10 bg-white/70 backdrop-blur px-4 py-2 text-sm transition-all duration-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]",
        "placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/15 focus-visible:border-accent",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:placeholder:text-zinc-500",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
