"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "./ui/PageHeader";
import { Button } from "./ui/Button";
import { Plus, Trash2, Calendar, Wallet, Filter, ArrowRight, ChevronRight } from "lucide-react";
import { Card } from "./ui/Card";
import { formatCurrency, cn } from "@/lib/utils";
import { deleteExpense } from "@/actions/expenses";
import { useToast } from "./ui/Toast";
import { ConfirmModal } from "./ui/ConfirmModal";
import ExpenseModal from "./ExpenseModal";
import { Expense } from "@prisma/client";
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from "date-fns";
import { id } from "date-fns/locale";

interface ExpenseControllerProps {
  expenses: Expense[];
}

export default function ExpenseController({ expenses }: ExpenseControllerProps) {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Filter States
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-01")); // Default to start of month
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const start = startOfDay(parseISO(startDate));
      const end = endOfDay(parseISO(endDate));
      return isWithinInterval(expDate, { start, end });
    });
  }, [expenses, startDate, endDate]);

  const totalFiltered = filteredExpenses.reduce((acc, exp) => acc + exp.amount, 0);

  const openDeleteConfirm = (id: string) => {
    setSelectedId(id);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      const result = await deleteExpense(selectedId);
      if (result.success) {
        showToast("Catatan pengeluaran dihapus.", "success");
      }
    } finally {
      setSelectedId(null);
      setIsConfirmOpen(false);
    }
  };

  return (
    <>
      <PageHeader 
        category="Finance Archive"
        title="Catatan Pengeluaran"
        description="Kelola dan pantau seluruh arus kas keluar bisnis Anda."
        action={
          <Button onClick={() => setIsModalOpen(true)} className="shadow-lg shadow-primary/20">
            <Plus size={18} strokeWidth={3} />
            TAMBAH PENGELUARAN
          </Button>
        }
      />

      <div className="space-y-10">
        {/* Filter Section */}
        <Card className="border-2 border-primary/5 bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Filter size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-black text-zinc-900 tracking-tight leading-none">Filter Periode</h3>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Pilih rentang tanggal</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors" size={16} />
                <input 
                  type="date" 
                  className="bg-zinc-50 border border-zinc-100 text-zinc-900 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="h-[2px] w-4 bg-zinc-200 rounded-full" />
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors" size={16} />
                <input 
                  type="date" 
                  className="bg-zinc-50 border border-zinc-100 text-zinc-900 pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="px-6 py-4 rounded-2xl bg-zinc-900 text-white flex items-center gap-4 shadow-xl shadow-zinc-200">
              <Wallet size={20} className="text-primary" />
              <div>
                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em] leading-none mb-1">Total Terfilter</p>
                <p className="text-xl font-black tracking-tighter">{formatCurrency(totalFiltered)}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* History List */}
        <div className="space-y-6">
          {filteredExpenses.length === 0 ? (
            <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-zinc-50 border-dashed">
              <p className="text-zinc-300 font-bold uppercase tracking-widest text-sm">Tidak ada data untuk periode ini</p>
            </div>
          ) : (
            filteredExpenses.map((exp) => (
              <div key={exp.id} className="group p-8 rounded-[2.5rem] bg-white border border-zinc-50 shadow-sm flex items-center justify-between hover:border-primary/20 hover:shadow-xl hover:shadow-zinc-200/20 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8">
                <div className="flex items-center gap-8">
                  <div className="h-16 w-16 rounded-3xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-zinc-900 tracking-tight group-hover:text-primary transition-colors">{exp.description}</h4>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                        {format(new Date(exp.date), 'EEEE, dd MMMM yyyy', { locale: id })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <p className="text-2xl font-black text-zinc-900 tracking-tighter">{formatCurrency(exp.amount)}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => openDeleteConfirm(exp.id)}
                    className="h-12 w-12 rounded-xl bg-red-50 text-red-200 hover:text-red-500 hover:bg-red-100 transition-all border border-red-50"
                  >
                    <Trash2 size={20} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ExpenseModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Pengeluaran"
        message="Apakah Anda yakin ingin menghapus catatan pengeluaran ini?"
      />
    </>
  );
}
