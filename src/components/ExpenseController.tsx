"use client";

import React, { useState } from "react";
import { PageHeader } from "./ui/PageHeader";
import { Button } from "./ui/Button";
import { Plus, Trash2, ShoppingBag, Calendar, DollarSign, Wallet } from "lucide-react";
import { Card } from "./ui/Card";
import { formatCurrency, cn } from "@/lib/utils";
import { addExpense, deleteExpense } from "@/actions/expenses";
import { useToast } from "./ui/Toast";
import { ConfirmModal } from "./ui/ConfirmModal";
import { Expense } from "@prisma/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface ExpenseControllerProps {
  expenses: Expense[];
}

export default function ExpenseController({ expenses }: ExpenseControllerProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    setLoading(true);
    try {
      const result = await addExpense({
        description,
        amount: parseFloat(amount),
        category: "Belanja Harian"
      });

      if (result.success) {
        showToast("Pengeluaran berhasil dicatat.", "success");
        setDescription("");
        setAmount("");
      } else {
        showToast(result.error || "Gagal mencatat pengeluaran.", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan sistem.", "error");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirm = (id: string) => {
    setSelectedId(id);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      const result = await deleteExpense(selectedId);
      if (result.success) {
        showToast("Catatan belanja dihapus.", "success");
      }
    } finally {
      setSelectedId(null);
      setIsConfirmOpen(false);
    }
  };

  const totalToday = expenses.reduce((acc, exp) => acc + exp.amount, 0);

  return (
    <>
      <PageHeader 
        category="Manajemen Keuangan"
        title="Catat Belanja & Operasional"
        description="Input semua pengeluaran hari ini (pasar, gas, listrik, dll) untuk menghitung untung bersih."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <div className="mb-8 flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Plus size={24} strokeWidth={3} />
              </div>
              <h3 className="text-xl font-black text-zinc-900 tracking-tight">Input Belanja</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Keterangan</label>
                <div className="relative group">
                  <ShoppingBag className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="Contoh: Belanja Pasar Pagi"
                    className="w-full bg-zinc-50 border border-zinc-100 text-zinc-900 pl-14 pr-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold placeholder:text-zinc-300"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Total Biaya (IDR)</label>
                <div className="relative group">
                  <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors" size={18} />
                  <input 
                    type="number" 
                    placeholder="Contoh: 500000"
                    className="w-full bg-zinc-50 border border-zinc-100 text-zinc-900 pl-14 pr-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold placeholder:text-zinc-300"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full py-4 shadow-xl shadow-primary/20" isLoading={loading}>
                SIMPAN PENGELUARAN
              </Button>
            </form>
          </Card>
        </div>

        {/* History Section */}
        <div className="lg:col-span-2">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="text-xl font-black text-zinc-900 tracking-tight">Riwayat Belanja</h3>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-50 border border-zinc-100">
              <Wallet size={16} className="text-primary" />
              <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Total: {formatCurrency(totalToday)}</span>
            </div>
          </div>

          <div className="space-y-4">
            {expenses.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-[2.5rem] border border-zinc-50 border-dashed">
                <p className="text-zinc-300 font-bold uppercase tracking-widest text-xs">Belum ada pengeluaran hari ini</p>
              </div>
            ) : (
              expenses.map((exp) => (
                <div key={exp.id} className="group p-6 rounded-[2rem] bg-white border border-zinc-50 shadow-sm flex items-center justify-between hover:border-primary/20 transition-all animate-in fade-in slide-in-from-right-4">
                  <div className="flex items-center gap-6">
                    <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-zinc-900 tracking-tight">{exp.description}</h4>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mt-1">
                        {format(new Date(exp.date), 'EEEE, dd MMMM yyyy', { locale: id })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <p className="text-lg font-black text-zinc-900 tracking-tighter">{formatCurrency(exp.amount)}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => openDeleteConfirm(exp.id)}
                      className="p-2 h-10 w-10 rounded-xl text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Catatan Belanja"
        message="Apakah Anda yakin ingin menghapus catatan pengeluaran ini? Ini akan mengubah laporan keuntungan Anda."
      />
    </>
  );
}
