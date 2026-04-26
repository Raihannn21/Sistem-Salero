"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "./ui/PageHeader";
import { Card } from "./ui/Card";
import DatePicker from "./ui/DatePicker";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  BarChart3,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "./ui/Button";

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

const ITEMS_PER_PAGE = 15;

export default function ReportController({ sales, expenses }: ReportControllerProps) {
  // Filter States - Empty for all
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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
      let matchesDate = true;
      if (startDate && endDate) {
        const start = startOfDay(parseISO(startDate));
        const end = endOfDay(parseISO(endDate));
        matchesDate = isWithinInterval(item.date, { start, end });
      } else if (startDate) {
        matchesDate = item.date >= startOfDay(parseISO(startDate));
      } else if (endDate) {
        matchesDate = item.date <= endOfDay(parseISO(endDate));
      }
      return matchesDate;
    });
  }, [allTransactions, startDate, endDate]);

  // Reset pagination on filter change
  useMemo(() => {
    setCurrentPage(1);
  }, [startDate, endDate]);

  // Calculations
  const totals = useMemo(() => {
    return filteredData.reduce((acc, curr) => {
      if (curr.type === "INCOME") acc.income += curr.amount;
      else acc.expense += curr.amount;
      return acc;
    }, { income: 0, expense: 0 });
  }, [filteredData]);

  const netProfit = totals.income - totals.expense;

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      <PageHeader 
        category="Financial Insights"
        title="Laporan Arus Kas"
        description="Pantau performa bisnis dan keuntungan bersih Salero dalam satu layar."
      />

      <div className="space-y-10">
        {/* Date Range Filter */}
        <Card className="border-2 border-primary/5 bg-white shadow-premium p-8 md:p-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-[1.5rem] bg-primary/5 flex items-center justify-center text-primary shrink-0">
                <BarChart3 size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-xl font-black text-zinc-900 tracking-tight leading-none mb-2">Periode Laporan</h3>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Kosongkan tanggal untuk melihat semua data</p>
              </div>
            </div>

            <div className="flex-1 max-w-2xl">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <DatePicker 
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="Mulai Tanggal"
                  className="flex-1"
                />
                <ArrowRight size={16} className="text-zinc-300 hidden sm:block shrink-0" />
                <DatePicker 
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="Sampai Tanggal"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card padding="lg" className="border-b-4 border-b-emerald-500 bg-white shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                <TrendingUp size={24} />
              </div>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Pemasukan</span>
            </div>
            <p className="text-3xl font-black text-zinc-900 tracking-tighter">{formatCurrency(totals.income)}</p>
          </Card>

          <Card padding="lg" className="border-b-4 border-b-rose-500 bg-white shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                <TrendingDown size={24} />
              </div>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Pengeluaran</span>
            </div>
            <p className="text-3xl font-black text-zinc-900 tracking-tighter">{formatCurrency(totals.expense)}</p>
          </Card>

          <Card padding="lg" className={cn("border-b-4 bg-white shadow-sm", netProfit >= 0 ? "border-b-primary" : "border-b-zinc-400")}>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Wallet size={24} />
              </div>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Laba Bersih</span>
            </div>
            <p className={cn("text-3xl font-black tracking-tighter", netProfit >= 0 ? "text-primary" : "text-zinc-400")}>
              {formatCurrency(netProfit)}
            </p>
          </Card>
        </div>

        {/* Transaction Journal */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-primary rounded-full" />
                <h3 className="text-xl font-black text-zinc-900 tracking-tight">Jurnal Arus Kas</h3>
             </div>
             <div className="px-4 py-2 rounded-xl bg-zinc-50 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                {filteredData.length} Data
             </div>
          </div>

          <div className="bg-white border-2 border-zinc-50 rounded-[2.5rem] overflow-hidden shadow-premium">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-50">
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Tanggal & Waktu</th>
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Keterangan Transaksi</th>
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Nominal (IDR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-300 group-hover:bg-white group-hover:shadow-md transition-all duration-300">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <p className="font-black text-zinc-900 text-sm tracking-tight">{format(item.date, 'dd MMM yyyy', { locale: id })}</p>
                          <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest mt-1">{format(item.date, 'HH:mm')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center shadow-sm",
                          item.type === "INCOME" ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"
                        )}>
                          {item.type === "INCOME" ? <ArrowUpRight size={18} strokeWidth={3} /> : <ArrowDownRight size={18} strokeWidth={3} />}
                        </div>
                        <span className="font-bold text-zinc-700 tracking-tight">{item.description}</span>
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
                
                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-24 text-center">
                      <div className="h-20 w-20 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-200 mx-auto mb-4">
                        <BarChart3 size={40} />
                      </div>
                      <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">Tidak ada data arus kas ditemukan.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination for Reports Table */}
            {totalPages > 1 && (
              <div className="px-8 py-6 border-t border-zinc-50 flex items-center justify-between bg-zinc-50/20">
                <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                  Hal {currentPage} dari {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-30"
                  >
                    <ChevronLeft size={16} className="mr-1" /> Prev
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-30"
                  >
                    Next <ChevronRight size={16} className="ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
