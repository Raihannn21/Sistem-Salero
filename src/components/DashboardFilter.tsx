"use client";

import React, { useState } from "react";
import { Calendar, Filter, ChevronRight, ArrowRight, X } from "lucide-react";
import DatePicker from "@/components/ui/DatePicker";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "./ui/Button";

export default function DashboardFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");

  const applyFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (startDate) params.set("startDate", startDate);
    else params.delete("startDate");
    
    if (endDate) params.set("endDate", endDate);
    else params.delete("endDate");
    
    router.push(`/?${params.toString()}`);
  };

  const clearFilter = () => {
    setStartDate("");
    setEndDate("");
    router.push("/");
  };

  const setQuickRange = (range: string) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    if (range === "today") {
      start = today;
      end = today;
    } else if (range === "week") {
      start = new Date(today.setDate(today.getDate() - 7));
      end = new Date();
    } else if (range === "month") {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date();
    }

    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];
    
    router.push(`/?startDate=${startStr}&endDate=${endStr}`);
  };

  const isFiltered = searchParams.get("startDate") || searchParams.get("endDate");

  return (
    <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="p-6 md:p-8 flex flex-col gap-8">
        
        {/* Header & Quick Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
              <Filter size={18} />
            </div>
            <div>
              <h4 className="text-sm font-black text-zinc-900 uppercase tracking-tight">Filter Laporan</h4>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Atur rentang data dashboard</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setQuickRange("today")}
              className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-600 transition-all active:scale-95 border border-zinc-100"
            >
              Hari Ini
            </button>
            <button 
              onClick={() => setQuickRange("week")}
              className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-600 transition-all active:scale-95 border border-zinc-100"
            >
              7 Hari
            </button>
            <button 
              onClick={() => setQuickRange("month")}
              className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-600 transition-all active:scale-95 border border-zinc-100"
            >
              Bulan Ini
            </button>
            {isFiltered && (
              <button 
                onClick={clearFilter}
                className="flex items-center justify-center h-11 w-11 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all"
                title="Hapus Filter"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="h-px w-full bg-zinc-50" />

        {/* Custom Range Picker */}
        <div className="flex flex-col lg:flex-row items-end gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3 w-full">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Dari Tanggal</label>
              <DatePicker 
                value={startDate}
                onChange={setStartDate}
                placeholder="Pilih Tanggal"
              />
            </div>
            <div className="hidden sm:flex h-12 items-center pt-6">
              <ArrowRight size={16} className="text-zinc-200" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Sampai Tanggal</label>
              <DatePicker 
                value={endDate}
                onChange={setEndDate}
                placeholder="Pilih Tanggal"
              />
            </div>
          </div>
          
          <Button 
            onClick={applyFilter} 
            className="w-full lg:w-48 h-14 rounded-2xl font-black text-[10px] tracking-widest uppercase shadow-xl shadow-primary/10 transition-all hover:scale-[1.02] active:scale-95"
          >
            Terapkan Filter
          </Button>
        </div>
      </div>
    </div>
  );
}
