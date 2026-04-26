"use client";

import React, { useState, useEffect } from "react";
import Modal from "./ui/Modal";
import { Button } from "./ui/Button";
import { Plus, ShoppingBag, Calendar, DollarSign, ArrowRight } from "lucide-react";
import { addExpense } from "@/actions/expenses";
import { useToast } from "./ui/Toast";
import { format } from "date-fns";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExpenseModal({ isOpen, onClose }: ExpenseModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    setLoading(true);
    try {
      const result = await addExpense({
        description,
        amount: parseFloat(amount),
        category: "Operasional",
        date: new Date(date)
      });

      if (result.success) {
        showToast("Pengeluaran berhasil dicatat.", "success");
        setDescription("");
        setAmount("");
        onClose();
      } else {
        showToast(result.error || "Gagal mencatat pengeluaran.", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan sistem.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Catat Pengeluaran Baru">
      <form onSubmit={handleSubmit} className="space-y-8 p-2">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Kapan Pengeluaran Ini?</label>
          <div className="relative group">
            <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="date" 
              className="w-full bg-zinc-50 border border-zinc-100 text-zinc-900 pl-14 pr-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Keterangan / Nama Barang</label>
          <div className="relative group">
            <ShoppingBag className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Contoh: Belanja Pasar / Bayar Gas"
              className="w-full bg-zinc-50 border border-zinc-100 text-zinc-900 pl-14 pr-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold placeholder:text-zinc-300"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Nominal Biaya (IDR)</label>
          <div className="relative group">
            <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="number" 
              placeholder="0"
              className="w-full bg-zinc-50 border border-zinc-100 text-zinc-900 pl-14 pr-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold placeholder:text-zinc-300"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button variant="ghost" type="button" onClick={onClose} className="flex-1">Batal</Button>
          <Button type="submit" className="flex-[2] shadow-xl shadow-primary/20" isLoading={loading}>
            SIMPAN DATA
          </Button>
        </div>
      </form>
    </Modal>
  );
}
