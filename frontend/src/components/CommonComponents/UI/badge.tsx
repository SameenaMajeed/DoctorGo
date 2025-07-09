
import { HTMLAttributes } from "react";
import { cn } from "../../../Utils/Utils";

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline";
}

export const Badge = ({
  className,
  variant = "default",
  ...props
}: BadgeProps) => {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variant === "outline" 
          ? "border-input bg-transparent hover:bg-accent hover:text-accent-foreground"
          : "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        className
      )}
      {...props}
    />
  );
};