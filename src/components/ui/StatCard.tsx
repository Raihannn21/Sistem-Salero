import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isUp: boolean;
  };
  description?: string;
  variant?: "primary" | "zinc";
  className?: string;
}

export const StatCard = ({ title, value, icon, trend, description, variant = "zinc", className }: StatCardProps) => {
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-[2.5rem] bg-white p-8 border border-zinc-50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_20px_60px_-10px_rgba(128,0,0,0.08)] hover:-translate-y-1",
      className
    )}>
      <div className="mb-6 flex items-center justify-between">
        <div className={cn(
          "flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-500",
          variant === "primary" ? "bg-primary text-white shadow-xl shadow-primary/20 rotate-3 group-hover:rotate-0" : "bg-zinc-50 text-zinc-400 border border-zinc-100"
        )}>
          {icon}
        </div>
        {trend && (
          <span className={cn(
            "flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-full",
            trend.isUp ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
          )}>
            <TrendingUp size={12} strokeWidth={3} className={!trend.isUp ? "rotate-180" : ""} />
            {trend.value}%
          </span>
        )}
      </div>
      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">{title}</p>
      <h3 className="text-2xl font-extrabold text-zinc-900 mt-2 tracking-tight leading-none group-hover:text-primary transition-colors">{value}</h3>
      {description && (
        <div className="mt-4 text-xs font-bold text-zinc-400 flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-primary/40"></div>
          {description}
        </div>
      )}
    </div>
  );
};
