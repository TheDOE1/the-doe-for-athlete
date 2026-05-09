import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  color?: "blue" | "green" | "orange" | "red";
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, color = "blue", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500 ease-out",
          color === "blue" && "bg-blue-500",
          color === "green" && "bg-emerald-500",
          color === "orange" && "bg-amber-500",
          color === "red" && "bg-red-500"
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
);
Progress.displayName = "Progress";

export { Progress };
