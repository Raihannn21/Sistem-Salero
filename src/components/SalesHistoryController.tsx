"use client";

import React, { useState } from "react";
import { History, Calendar, User as UserIcon, Trash2, Edit2, Search, Receipt, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { deleteSale } from "@/actions/sales";
import { useToast } from "./ui/Toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import SaleModal from "./SaleModal";
import { ConfirmModal } from "./ui/ConfirmModal";
import { MenuItem, Sale, Transaction } from "@prisma/client";
import { cn, formatCurrency } from "@/lib/utils";

interface TransactionWithDetails extends Transaction {
  sales: (Sale & { menuItem: MenuItem })[];
  user: {
    username: string;
    fullName: string | null;
  }
}

interface SalesHistoryControllerProps {
  initialTransactions: TransactionWithDetails[];
  menuItems: MenuItem[];
}

export default function SalesHistoryController({ initialTransactions, menuItems }: SalesHistoryControllerProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const userRole = (session?.user as any)?.role || "EMPLOYEE";
  const isOwner = userRole === "OWNER";

  const handleEdit = (sale: any) => {
    // Memastikan data item yang dikirim ke modal lengkap
    setEditData({
      id: sale.id,
      menuItemId: sale.menuItemId,
      quantity: sale.quantity
    });
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (id: string) => {
    setSelectedId(id);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      const result = await deleteSale(selectedId);
      if (result.success) {
        showToast("Transaksi berhasil dihapus.", "success");
        router.refresh();
      }
    } finally {
      setSelectedId(null);
      setIsConfirmOpen(false);
    }
  };

  const filteredTransactions = initialTransactions.filter(tx => 
    tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tx.user.fullName || tx.user.username).toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.sales.some(s => s.menuItem.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      <PageHeader 
        category="Archive"
        title="Riwayat Transaksi"
        description="Daftar lengkap semua transaksi (Nota) yang telah tercatat di sistem Salero."
      />

      <div className="mb-10 relative max-w-md group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors" size={20} />
        <input
          type="text"
          placeholder="Cari Nota, Menu, atau Karyawan..."
          className="w-full bg-white border border-zinc-100 text-zinc-900 pl-14 pr-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 shadow-sm transition-all font-bold placeholder:text-zinc-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card padding="none" className="overflow-hidden border-2 border-zinc-50 shadow-premium">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-50 bg-zinc-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Nota / ID</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Karyawan & Waktu</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Detail Pesanan</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Total Akhir</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredTransactions.map((tx) => (
                <React.Fragment key={tx.id}>
                  <tr 
                    className={cn(
                      "hover:bg-zinc-50/50 transition-colors cursor-pointer group",
                      expandedRow === tx.id ? "bg-zinc-50/50" : ""
                    )}
                    onClick={() => setExpandedRow(expandedRow === tx.id ? null : tx.id)}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
                          <Receipt size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">ID NOTA</p>
                          <p className="text-xs font-black text-zinc-900">#{tx.id.slice(-8).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-zinc-900 font-black text-xs uppercase tracking-tight">
                          <UserIcon size={12} className="text-primary" />
                          {tx.user.fullName || tx.user.username}
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400 font-bold text-[10px] uppercase tracking-wider">
                          <Calendar size={10} />
                          {format(new Date(tx.date), "HH:mm, dd MMM", { locale: id })}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {tx.sales.slice(0, 2).map((s, idx) => (
                            <span key={idx} className="inline-flex items-center px-3 py-1 rounded-lg bg-zinc-100 text-zinc-600 text-[10px] font-black uppercase">
                              {s.quantity}x {s.menuItem.name}
                            </span>
                          ))}
                          {tx.sales.length > 2 && (
                            <span className="text-[10px] font-black text-zinc-400 mt-1">+{tx.sales.length - 2} Lainnya</span>
                          )}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className="text-lg font-black text-zinc-900 tracking-tighter">{formatCurrency(tx.totalAmount)}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center">
                        {expandedRow === tx.id ? <ChevronUp size={20} className="text-primary" /> : <ChevronDown size={20} className="text-zinc-300" />}
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expanded Details */}
                  {expandedRow === tx.id && (
                    <tr>
                      <td colSpan={5} className="px-8 py-0 bg-zinc-50/30">
                        <div className="py-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tx.sales.map((sale) => (
                              <div key={sale.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm group/item">
                                <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 rounded-xl bg-zinc-50 text-zinc-400 flex items-center justify-center font-black text-xs">
                                    {sale.quantity}x
                                  </div>
                                  <div>
                                    <p className="font-black text-zinc-900 text-sm tracking-tight">{sale.menuItem.name}</p>
                                    <p className="text-[10px] font-bold text-zinc-400">{formatCurrency(sale.totalPrice / sale.quantity)} / porsi</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <p className="text-sm font-black text-zinc-900 mr-2">{formatCurrency(sale.totalPrice)}</p>
                                  {isOwner && (
                                    <div className="flex items-center gap-2">
                                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(sale); }} className="h-8 w-8 p-0 rounded-lg bg-zinc-50 text-zinc-400 hover:text-primary">
                                        <Edit2 size={14} />
                                      </Button>
                                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openDeleteConfirm(sale.id); }} className="h-8 w-8 p-0 rounded-lg bg-zinc-50 text-zinc-400 hover:text-rose-500">
                                        <Trash2 size={14} />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-32 text-center">
                    <div className="h-20 w-20 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-200 mx-auto mb-4">
                      <History size={40} />
                    </div>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Tidak ada riwayat transaksi.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <SaleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        menuItems={menuItems}
        editData={editData}
      />

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Catatan"
        message="Apakah Anda yakin ingin menghapus catatan pesanan ini dari nota?"
      />
    </>
  );
}
