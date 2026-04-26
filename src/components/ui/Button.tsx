import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    const variants = {
      primary: "bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary-hover active:scale-[0.98]",
      secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:scale-[0.98]",
      outline: "bg-transparent border border-zinc-200 text-zinc-600 hover:bg-zinc-50 active:scale-[0.98]",
      ghost: "bg-transparent text-zinc-500 hover:bg-zinc-50 hover:text-primary active:scale-[0.95]",
      danger: "bg-red-500 text-white shadow-xl shadow-red-500/20 hover:bg-red-600 active:scale-[0.98]",
    };

    const sizes = {
      sm: "px-4 py-2 text-xs",
      md: "px-7 py-3.5 text-sm",
      lg: "px-10 py-5 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2.5 rounded-xl font-bold transition-all tracking-wide disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
