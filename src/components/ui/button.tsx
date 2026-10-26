"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: "accent-gradient glow text-white font-semibold hover:brightness-110 hover:-translate-y-px",
        secondary:
          "bg-zinc-900/5 text-zinc-900 hover:bg-zinc-900/10 dark:bg-white/10 dark:text-zinc-100 dark:hover:bg-white/15",
        ghost:
          "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300",
        destructive: "bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-[0_8px_24px_-8px_rgba(225,29,72,0.6)] hover:brightness-110",
        outline:
          "border border-zinc-900/10 bg-white/50 backdrop-blur dark:border-white/10 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10",
      },
      size: {
        default: "h-12 px-5 py-2 rounded-2xl",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
