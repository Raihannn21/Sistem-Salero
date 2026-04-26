"use client";

import React, { useState, useMemo } from "react";
import { PageHeader } from "./ui/PageHeader";
import { Button } from "./ui/Button";
import { Plus, Trash2, Calendar, Wallet, Filter, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "./ui/Card";
import DatePicker from "./ui/DatePicker";
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

const ITEMS_PER_PAGE = 15;

export default function ExpenseController({ expenses }: ExpenseControllerProps) {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      let matchesDate = true;
      if (startDate && endDate) {
        matchesDate = isWithinInterval(expDate, { 
          start: startOfDay(parseISO(startDate)), 
          end: endOfDay(parseISO(endDate)) 
        });
      } else if (startDate) {
        matchesDate = expDate >= startOfDay(parseISO(startDate));
      } else if (endDate) {
        matchesDate = expDate <= endOfDay(parseISO(endDate));
      }
      return matchesDate;
    });
  }, [expenses, startDate, endDate]);

  useMemo(() => {
    setCurrentPage(1);
  }, [startDate, endDate]);

  const totalFiltered = filteredExpenses.reduce((acc, exp) => acc + exp.amount, 0);

  const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
            <span className="hidden sm:inline ml-2">TAMBAH PENGELUARAN</span>
            <span className="sm:hidden ml-2">TAMBAH</span>
          </Button>
        }
      />

      <div className="space-y-6 md:space-y-10">
        {/* Filter Section */}
        <Card className="border-2 border-primary/5 bg-white shadow-premium p-6 md:p-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl md:rounded-[1.5rem] bg-primary/5 flex items-center justify-center text-primary shrink-0">
                <Filter size={24} strokeWidth={2.5} className="md:w-7 md:h-7" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-black text-zinc-900 tracking-tight leading-none mb-1 md:mb-2">Filter Data</h3>
                <p className="text-[9px] md:text-[10px] font-black text-zinc-400 uppercase tracking-widest">Atur periode audit Anda</p>
              </div>
            </div>

            <div className="flex-1 w-full lg:max-w-xl">
              <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4">
                <DatePicker 
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="Mulai"
                  className="w-full"
                />
                <ArrowRight size={16} className="text-zinc-300 hidden sm:block shrink-0" />
                <DatePicker 
                  value={endDate}
                  onChange={setEndDate}
                  placeholder="Sampai"
                  className="w-full"
                />
              </div>
            </div>

            <div className="px-6 py-4 md:px-8 md:py-5 rounded-2xl md:rounded-[1.5rem] bg-zinc-950 text-white flex items-center gap-4 md:gap-6 shadow-2xl shadow-zinc-200">
              <Wallet size={20} className="text-primary md:w-6 md:h-6" />
              <div>
                <p className="text-[8px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1 md:mb-2">Total</p>
                <p className="text-lg md:text-2xl font-black tracking-tighter">{formatCurrency(totalFiltered)}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* History List */}
        <div className="space-y-4">
          {paginatedExpenses.length === 0 ? (
            <div className="py-24 md:py-32 text-center bg-white rounded-[2rem] md:rounded-[3rem] border-2 border-zinc-50 border-dashed">
              <p className="text-zinc-300 font-bold uppercase tracking-widest text-[10px] md:text-xs">Data tidak ditemukan</p>
            </div>
          ) : (
            paginatedExpenses.map((exp) => (
              <div key={exp.id} className="group p-5 md:p-6 rounded-2xl md:rounded-[2rem] bg-white border border-zinc-50 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between hover:border-primary/20 hover:shadow-xl hover:shadow-zinc-200/20 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto">
                  <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-300 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-500 shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base md:text-lg font-black text-zinc-900 tracking-tight group-hover:text-primary transition-colors truncate pr-2">
                      {exp.description}
                    </h4>
                    <p className="text-[10px] md:text-[11px] font-bold text-zinc-400 uppercase tracking-wide mt-0.5">
                      {format(new Date(exp.date), 'EEEE, d MMM yyyy', { locale: id })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-zinc-50">
                  <p className="text-lg md:text-xl font-black text-zinc-900 tracking-tighter sm:mr-6">
                    {formatCurrency(exp.amount)}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => openDeleteConfirm(exp.id)}
                    className="h-10 w-10 md:h-11 md:w-11 rounded-xl bg-red-50 text-red-300 hover:text-red-500 hover:bg-red-100 transition-all border border-red-50 p-0 shrink-0"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 md:mt-12 pb-10">
            <Button 
              variant="ghost" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-10 md:h-12 px-4 md:px-6 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest"
            >
              <ChevronLeft size={16} className="mr-1 md:mr-2" /> Prev
            </Button>
            
            <div className="flex items-center gap-1 md:gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={cn(
                    "h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl font-black text-xs transition-all",
                    currentPage === i + 1 ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-zinc-400 hover:bg-zinc-100"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <Button 
              variant="ghost" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-10 md:h-12 px-4 md:px-6 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest"
            >
              Next <ChevronRight size={16} className="ml-1 md:ml-2" />
            </Button>
          </div>
        )}
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
