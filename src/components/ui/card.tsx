"use client";

import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "glass rounded-3xl transition-all duration-300",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export { Card };
