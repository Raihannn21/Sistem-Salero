import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card = ({ className, padding = "md", children, ...props }: CardProps) => {
  const paddings = {
    none: "p-0",
    sm: "p-6",
    md: "p-8",
    lg: "p-10",
  };

  return (
    <div
      className={cn(
        "bg-white rounded-[2.5rem] border border-zinc-50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)]",
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
