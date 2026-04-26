"use client";

import React, { useState } from "react";
import { PageHeader } from "./ui/PageHeader";
import { Card } from "./ui/Card";
import { formatCurrency, cn } from "@/lib/utils";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  TrendingUp, 
  Calendar,
  Filter,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
}

interface ReportControllerProps {
  transactions: Transaction[];
  totalRevenue: number;
  totalExpenses: number;
}

export default function ReportController({ transactions, totalRevenue, totalExpenses }: ReportControllerProps) {
  const [filter, setFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  
  const filteredTransactions = transactions.filter(t => {
    if (filter === 'ALL') return true;
    return t.type === filter;
  });

  const netProfit = totalRevenue - totalExpenses;

  return (
    <>
      <PageHeader 
        category="Finance Analysis"
        title="Laporan Arus Kas"
        description="Pantau riwayat lengkap pemasukan dan pengeluaran restoran Anda."
        action={
          <Button variant="outline" onClick={() => window.print()} className="bg-white border-zinc-100">
            <Download size={18} className="mr-2" />
            CETAK LAPORAN
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card className="border-green-100 bg-green-50/20">
          <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-3">Total Pemasukan</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-zinc-900 tracking-tighter">{formatCurrency(totalRevenue)}</h3>
            <div className="h-10 w-10 rounded-xl bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-200">
              <ArrowUpRight size={20} strokeWidth={3} />
            </div>
          </div>
        </Card>

        <Card className="border-red-100 bg-red-50/20">
          <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-3">Total Pengeluaran</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-zinc-900 tracking-tighter">{formatCurrency(totalExpenses)}</h3>
            <div className="h-10 w-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-200">
              <ArrowDownRight size={20} strokeWidth={3} />
            </div>
          </div>
        </Card>

        <Card className="border-primary/10 bg-primary/5">
          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3">Laba Bersih</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-zinc-900 tracking-tighter">{formatCurrency(netProfit)}</h3>
            <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
              <TrendingUp size={20} strokeWidth={3} />
            </div>
          </div>
        </Card>
      </div>

      {/* Transaction Table */}
      <Card padding="none" className="overflow-hidden">
        <div className="p-8 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
          <div className="flex items-center gap-3">
            <Wallet className="text-zinc-400" size={20} />
            <h3 className="text-lg font-black text-zinc-900 tracking-tight">Jurnal Transaksi</h3>
          </div>
          
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-zinc-100 shadow-sm">
            <button 
              onClick={() => setFilter('ALL')}
              className={cn("px-4 py-2 text-[10px] font-black rounded-lg transition-all", filter === 'ALL' ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-900")}
            >SEMUA</button>
            <button 
              onClick={() => setFilter('INCOME')}
              className={cn("px-4 py-2 text-[10px] font-black rounded-lg transition-all", filter === 'INCOME' ? "bg-green-500 text-white" : "text-zinc-400 hover:text-green-500")}
            >MASUK</button>
            <button 
              onClick={() => setFilter('EXPENSE')}
              className={cn("px-4 py-2 text-[10px] font-black rounded-lg transition-all", filter === 'EXPENSE' ? "bg-red-500 text-white" : "text-zinc-400 hover:text-red-500")}
            >KELUAR</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tanggal & Waktu</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Keterangan</th>
                <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-zinc-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3 text-zinc-400 font-bold text-xs">
                      <Calendar size={14} className="group-hover:text-primary transition-colors" />
                      {format(new Date(t.date), "dd MMM yyyy, HH:mm", { locale: id })}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center shadow-sm",
                        t.type === 'INCOME' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                      )}>
                        {t.type === 'INCOME' ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />}
                      </div>
                      <span className="font-bold text-zinc-900 tracking-tight">{t.description}</span>
                    </div>
                  </td>
                  <td className={cn(
                    "px-8 py-6 text-right font-black text-lg tracking-tighter",
                    t.type === 'INCOME' ? "text-green-600" : "text-red-600"
                  )}>
                    {t.type === 'INCOME' ? "+" : "-"}{formatCurrency(t.amount)}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-32 text-center">
                    <div className="h-16 w-16 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-200 mx-auto mb-4">
                      <Filter size={32} />
                    </div>
                    <p className="text-zinc-400 font-bold text-sm uppercase tracking-widest">Tidak ada transaksi yang ditemukan</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

// Minimal Button component if not imported
function Button({ children, className, variant = 'primary', ...props }: any) {
  return (
    <button 
      className={cn(
        "px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center",
        variant === 'primary' ? "bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary/90" : "border border-zinc-100 text-zinc-600 hover:bg-zinc-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
