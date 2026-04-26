"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  name: string;
}

interface SelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function Select({ options, value, onChange, placeholder = "Pilih opsi...", label, icon, className }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {label && (
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-white border border-zinc-100 text-left px-6 py-4 rounded-2xl flex items-center justify-between transition-all duration-300 shadow-sm hover:border-primary/20 focus:ring-4 focus:ring-primary/5",
          isOpen ? "ring-4 ring-primary/5 border-primary/20" : ""
        )}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {icon && <span className="text-zinc-400 shrink-0">{icon}</span>}
          <span className={cn(
            "font-bold truncate",
            selectedOption ? "text-zinc-900" : "text-zinc-300"
          )}>
            {selectedOption ? selectedOption.name : placeholder}
          </span>
        </div>
        <ChevronDown className={cn(
          "text-zinc-300 transition-transform duration-300 shrink-0",
          isOpen ? "rotate-180 text-primary" : ""
        )} size={18} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-[100] bg-white border border-zinc-50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 max-h-60 overflow-y-auto custom-scrollbar">
            {options.map((option) => (
              <div
                key={option.id}
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex items-center justify-between px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 font-bold text-sm mb-1 last:mb-0",
                  value === option.id 
                    ? "bg-primary text-white" 
                    : "text-zinc-600 hover:bg-zinc-50"
                )}
              >
                {option.name}
                {value === option.id && <Check size={14} strokeWidth={4} />}
              </div>
            ))}
            {options.length === 0 && (
              <div className="p-4 text-center text-zinc-400 text-xs font-bold italic">
                Tidak ada data...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
