"use client";

import React, { useState } from "react";
import { History, Calendar, User as UserIcon, Trash2, Edit2, Search } from "lucide-react";
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
import { MenuItem, Sale } from "@prisma/client";

interface SaleWithMenu extends Sale {
  menuItem: MenuItem;
  user: {
    username: string;
    fullName: string | null;
  }
}

interface SalesHistoryControllerProps {
  initialSales: SaleWithMenu[];
  menuItems: MenuItem[];
}

export default function SalesHistoryController({ initialSales, menuItems }: SalesHistoryControllerProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const userRole = (session?.user as any)?.role || "EMPLOYEE";
  const isOwner = userRole === "OWNER";

  const handleEdit = (sale: any) => {
    setEditData(sale);
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

  const filteredSales = initialSales.filter(sale => 
    sale.menuItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sale.user.fullName || sale.user.username).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <PageHeader 
        category="Archive"
        title="Riwayat Transaksi"
        description="Daftar lengkap semua penjualan yang telah tercatat di sistem."
      />

      <div className="mb-10 relative max-w-md group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors" size={20} />
        <input
          type="text"
          placeholder="Cari menu atau nama karyawan..."
          className="w-full bg-white border border-zinc-100 text-zinc-900 pl-14 pr-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 shadow-sm transition-all font-bold placeholder:text-zinc-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-50 bg-zinc-50/30">
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Karyawan & Waktu</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Menu Terjual</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Kuantitas</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Total (IDR)</th>
                {isOwner && <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-zinc-900 font-black text-xs uppercase tracking-tight">
                        <UserIcon size={12} className="text-primary" />
                        {sale.user.fullName || sale.user.username}
                      </div>
                      <div className="flex items-center gap-2 text-zinc-400 font-bold text-[10px] uppercase tracking-wider">
                        <Calendar size={10} />
                        {format(new Date(sale.date), "HH:mm, dd MMM", { locale: id })}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-zinc-900 font-bold tracking-tight">{sale.menuItem.name}</td>
                  <td className="px-8 py-6 text-zinc-500 font-bold">{sale.quantity} porsi</td>
                  <td className="px-8 py-6 text-right font-black text-primary text-lg tracking-tighter">
                    Rp {sale.totalPrice.toLocaleString()}
                  </td>
                  {isOwner && (
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(sale)} className="h-10 w-10 p-0 rounded-xl border border-zinc-100 bg-white shadow-sm text-zinc-400 hover:text-primary">
                          <Edit2 size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openDeleteConfirm(sale.id)} className="h-10 w-10 p-0 rounded-xl border border-zinc-100 bg-white shadow-sm text-red-300 hover:text-red-500 hover:bg-red-50">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={isOwner ? 5 : 4} className="p-32 text-center">
                    <div className="h-20 w-20 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-200 mx-auto mb-4">
                      <History size={40} />
                    </div>
                    <p className="text-zinc-500 font-bold">Tidak ada riwayat transaksi.</p>
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
        title="Hapus Transaksi"
        message="Apakah Anda yakin ingin menghapus catatan penjualan ini?"
      />
    </>
  );
}
