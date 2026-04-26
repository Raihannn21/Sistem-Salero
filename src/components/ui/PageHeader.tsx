import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  category: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const PageHeader = ({ category, title, description, action, className }: PageHeaderProps) => {
  return (
    <header className={cn("mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center", className)}>
      <div>
        <div className="flex items-center gap-3 text-primary/60 font-black text-[10px] uppercase tracking-[0.3em] mb-3">
          <div className="h-[2px] w-8 bg-primary/40"></div>
          {category}
        </div>
        <h1 className="text-3xl lg:text-4xl font-extrabold text-zinc-900 tracking-tight leading-tight">
          {title}
        </h1>
        <p className="text-zinc-500 font-semibold text-base mt-2">
          {description}
        </p>
      </div>
      {action && (
        <div className="flex items-center gap-4">
          {action}
        </div>
      )}
    </header>
  );
};
