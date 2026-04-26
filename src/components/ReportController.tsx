"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "./ui/PageHeader";
import { Card } from "./ui/Card";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  BarChart3
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from "date-fns";
import { id } from "date-fns/locale";

interface TransactionItem {
  id: string;
  type: "INCOME" | "EXPENSE";
  description: string;
  amount: number;
  date: Date;
}

interface ReportControllerProps {
  sales: any[];
  expenses: any[];
}

export default function ReportController({ sales, expenses }: ReportControllerProps) {
  // Filter States
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-01")); // Start of month
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  // Unified Transactions
  const allTransactions: TransactionItem[] = useMemo(() => {
    const income = sales.map(s => ({
      id: s.id,
      type: "INCOME" as const,
      description: `Penjualan: ${s.menuItem.name} (${s.quantity}x)`,
      amount: s.totalPrice,
      date: new Date(s.date)
    }));

    const spend = expenses.map(e => ({
      id: e.id,
      type: "EXPENSE" as const,
      description: e.description,
      amount: e.amount,
      date: new Date(e.date)
    }));

    return [...income, ...spend].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [sales, expenses]);

  // Filtered Data
  const filteredData = useMemo(() => {
    return allTransactions.filter(item => {
      const start = startOfDay(parseISO(startDate));
      const end = endOfDay(parseISO(endDate));
      return isWithinInterval(item.date, { start, end });
    });
  }, [allTransactions, startDate, endDate]);

  // Calculations
  const totals = useMemo(() => {
    return filteredData.reduce((acc, curr) => {
      if (curr.type === "INCOME") acc.income += curr.amount;
      else acc.expense += curr.amount;
      return acc;
    }, { income: 0, expense: 0 });
  }, [filteredData]);

  const netProfit = totals.income - totals.expense;

  return (
    <>
      <PageHeader 
        category="Financial Insights"
        title="Laporan Arus Kas"
        description="Pantau performa bisnis dan keuntungan bersih Salero dalam satu layar."
      />

      <div className="space-y-10">
        {/* Date Range Filter */}
        <Card className="border-2 border-primary/5 bg-white shadow-xl shadow-zinc-200/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Calendar size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-black text-zinc-900 tracking-tight leading-none">Filter Periode Laporan</h3>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Ubah rentang waktu data</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="relative group">
                <input 
                  type="date" 
                  className="bg-zinc-50 border border-zinc-100 text-zinc-900 px-6 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="h-[2px] w-4 bg-zinc-200 rounded-full" />
              <div className="relative group">
                <input 
                  type="date" 
                  className="bg-zinc-50 border border-zinc-100 text-zinc-900 px-6 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card padding="lg" className="border-b-4 border-b-emerald-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                <TrendingUp size={20} />
              </div>
              <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Total Pemasukan</span>
            </div>
            <p className="text-3xl font-black text-zinc-900 tracking-tighter">{formatCurrency(totals.income)}</p>
          </Card>

          <Card padding="lg" className="border-b-4 border-b-rose-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                <TrendingDown size={20} />
              </div>
              <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Total Pengeluaran</span>
            </div>
            <p className="text-3xl font-black text-zinc-900 tracking-tighter">{formatCurrency(totals.expense)}</p>
          </Card>

          <Card padding="lg" className={cn("border-b-4", netProfit >= 0 ? "border-b-primary" : "border-b-zinc-400")}>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Wallet size={20} />
              </div>
              <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Laba Bersih</span>
            </div>
            <p className={cn("text-3xl font-black tracking-tighter", netProfit >= 0 ? "text-primary" : "text-zinc-400")}>
              {formatCurrency(netProfit)}
            </p>
          </Card>
        </div>

        {/* Transaction Journal */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-primary" size={24} strokeWidth={3} />
            <h3 className="text-xl font-black text-zinc-900 tracking-tight">Jurnal Transaksi Terfilter</h3>
          </div>

          <div className="bg-white border border-zinc-100 rounded-[2.5rem] overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-50">
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Tanggal & Waktu</th>
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Keterangan Transaksi</th>
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Nominal (IDR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-white group-hover:shadow-sm transition-all">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 text-sm">{format(item.date, 'dd MMM yyyy', { locale: id })}</p>
                          <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mt-1">{format(item.date, 'HH:mm')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center",
                          item.type === "INCOME" ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"
                        )}>
                          {item.type === "INCOME" ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />}
                        </div>
                        <span className="font-bold text-zinc-700">{item.description}</span>
                      </div>
                    </td>
                    <td className={cn(
                      "px-8 py-6 text-right font-black text-lg tracking-tighter",
                      item.type === "INCOME" ? "text-emerald-500" : "text-rose-500"
                    )}>
                      {item.type === "INCOME" ? "+" : "-"}{formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
                
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-24 text-center">
                      <div className="h-20 w-20 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-200 mx-auto mb-4">
                        <BarChart3 size={40} />
                      </div>
                      <p className="text-zinc-400 font-bold">Tidak ada transaksi di periode ini.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
