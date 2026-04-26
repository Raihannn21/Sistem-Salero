"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Clock, Calendar } from "lucide-react";

export default function RealTimeClock() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Prevent hydration mismatch by not rendering the time until mounted on client
  if (!mounted) {
    return (
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 opacity-0">
        <div className="flex items-center gap-3 px-5 py-2.5 bg-white border border-zinc-100 rounded-2xl shadow-sm">
           <div className="h-8 w-8 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
             <Clock size={16} strokeWidth={3} />
           </div>
           <div className="flex flex-col">
             <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest leading-none mb-1">Waktu Sekarang</p>
             <p className="text-sm font-black text-zinc-900 tracking-tight tabular-nums">--:--:-- WIB</p>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 px-5 py-2.5 bg-white border border-zinc-100 rounded-2xl shadow-sm">
        <div className="h-8 w-8 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
          <Clock size={16} strokeWidth={3} />
        </div>
        <div className="flex flex-col">
          <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest leading-none mb-1">Waktu Sekarang</p>
          <p className="text-sm font-black text-zinc-900 tracking-tight tabular-nums">
            {format(time, "HH:mm:ss")} WIB
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 px-5 py-2.5 bg-white border border-zinc-100 rounded-2xl shadow-sm">
        <div className="h-8 w-8 rounded-xl bg-zinc-50 text-zinc-400 flex items-center justify-center">
          <Calendar size={16} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest leading-none mb-1">Tanggal</p>
          <p className="text-sm font-black text-zinc-900 tracking-tight">
            {format(time, "EEEE, dd MMMM yyyy", { locale: id })}
          </p>
        </div>
      </div>
    </div>
  );
}
