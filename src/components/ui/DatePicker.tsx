"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  X 
} from "lucide-react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isToday
} from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export default function DatePicker({ value, onChange, placeholder = "Pilih tanggal...", label, className }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value) : null;

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDateSelect = (date: Date) => {
    onChange(format(date, "yyyy-MM-dd"));
    setIsOpen(false);
  };

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {label && (
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 mb-2 block">
          {label}
        </label>
      )}

      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative w-full bg-white border border-zinc-100 text-zinc-900 pl-14 pr-6 py-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-300 shadow-sm hover:border-primary/20",
          isOpen ? "ring-4 ring-primary/5 border-primary/20" : ""
        )}
      >
        <CalendarIcon className={cn("absolute left-5 top-1/2 -translate-y-1/2 transition-colors", isOpen ? "text-primary" : "text-zinc-300")} size={18} />
        <span className={cn("font-bold text-sm", !value && "text-zinc-300")}>
          {value ? format(new Date(value), "dd MMMM yyyy", { locale: id }) : placeholder}
        </span>
        {value && (
          <button onClick={clearDate} className="text-zinc-300 hover:text-red-500 transition-colors p-1">
            <X size={14} strokeWidth={3} />
          </button>
        )}
      </div>

      {/* Calendar Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-[110] bg-white border border-zinc-50 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.15)] p-6 w-[320px] animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-zinc-50 rounded-xl text-zinc-400 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <h4 className="font-black text-zinc-900 text-sm uppercase tracking-widest">
              {format(currentMonth, "MMMM yyyy", { locale: id })}
            </h4>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-zinc-50 rounded-xl text-zinc-400 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 mb-2">
            {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
              <div key={day} className="text-center text-[10px] font-black text-zinc-300 uppercase py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDate = isToday(day);

              return (
                <button
                  key={idx}
                  onClick={() => handleDateSelect(day)}
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all relative",
                    !isCurrentMonth && "text-zinc-200",
                    isCurrentMonth && !isSelected && "text-zinc-600 hover:bg-primary/5 hover:text-primary",
                    isSelected && "bg-primary text-white shadow-lg shadow-primary/20",
                    isTodayDate && !isSelected && "border border-primary/20 text-primary"
                  )}
                >
                  {format(day, "d")}
                  {isTodayDate && !isSelected && (
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Buttons */}
          <div className="mt-6 pt-4 border-t border-zinc-50 flex justify-between">
            <button 
              onClick={() => handleDateSelect(new Date())}
              className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
            >
              Hari Ini
            </button>
            <button 
              onClick={() => { setIsOpen(false); onChange(""); }}
              className="text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-red-500"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
