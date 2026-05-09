import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" &&
          "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
        variant === "success" &&
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
        variant === "warning" &&
          "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
        variant === "danger" &&
          "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        variant === "info" &&
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = "Badge";

export { Badge };
