"use client";

import React, { useState } from "react";
import { PageHeader } from "./ui/PageHeader";
import { Button } from "./ui/Button";
import { Plus, Search, Utensils, Trash2, Edit2, ShoppingBag } from "lucide-react";
import { Card } from "./ui/Card";
import { formatCurrency } from "@/lib/utils";
import MenuModal from "./MenuModal";
import { deleteMenuItem } from "@/actions/menu";
import { useToast } from "./ui/Toast";
import { ConfirmModal } from "./ui/ConfirmModal";
import { MenuItem } from "@prisma/client";

interface MenuControllerProps {
  menuItems: (MenuItem & { _count: { sales: number } })[];
}

export default function MenuController({ menuItems }: MenuControllerProps) {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editData, setEditData] = useState<MenuItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleEdit = (item: MenuItem) => {
    setEditData(item);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditData(null);
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (id: string) => {
    setSelectedId(id);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    try {
      const result = await deleteMenuItem(selectedId);
      if (result.success) {
        showToast("Menu berhasil dihapus.", "success");
      } else {
        showToast(result.error || "Gagal menghapus menu.", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan sistem saat menghapus data.", "error");
    } finally {
      setSelectedId(null);
    }
  };

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <PageHeader
        category="Katalog Produk"
        title="Daftar Menu"
        description="Kelola daftar produk dan harga jual Anda."
        action={
          <Button onClick={handleAdd}>
            <Plus size={18} strokeWidth={2.5} />
            TAMBAH MENU
          </Button>
        }
      />

      {/* Search Bar */}
      <div className="mb-10 relative max-w-md group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors" size={20} />
        <input
          type="text"
          placeholder="Cari menu..."
          className="w-full bg-white border border-zinc-100 text-zinc-900 pl-14 pr-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 shadow-sm transition-all font-bold placeholder:text-zinc-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredItems.map((item) => (
          <Card key={item.id} padding="none" className="group overflow-hidden flex flex-col h-full hover:border-primary/20 transition-all">
            <div className="p-8 pb-4 flex-1">
              <div className="flex items-start justify-between mb-6">
                <div className="h-16 w-16 rounded-[1.5rem] bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-300 group-hover:bg-primary/5 group-hover:border-primary/20 group-hover:text-primary transition-all duration-500">
                  <Utensils size={28} />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 h-10 w-10 rounded-xl bg-white shadow-sm border border-zinc-100 text-zinc-400 hover:text-primary hover:border-primary/20"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit2 size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 h-10 w-10 rounded-xl bg-white shadow-sm border border-zinc-100 text-zinc-400 hover:text-red-500 hover:border-red-100"
                    onClick={() => openDeleteConfirm(item.id)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>

              <h3 className="text-2xl font-black text-zinc-900 mb-6 tracking-tight">{item.name}</h3>

              <div className="pt-6 border-t border-zinc-50 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-1">Harga Jual</p>
                  <p className="text-xl font-black text-zinc-900 tracking-tighter">{formatCurrency(item.basePrice)}</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-50/50 p-6 flex items-center justify-between border-t border-zinc-50">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Terjual Hari Ini</span>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-sm border border-zinc-100 text-[11px] font-black tracking-tight text-zinc-600">
                <ShoppingBag size={12} className="text-primary" />
                {item._count.sales} Porsi
              </div>
            </div>
          </Card>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full py-32 text-center bg-zinc-50/50 rounded-[3rem] border border-dashed border-zinc-200">
            <div className="h-20 w-20 rounded-full bg-white shadow-sm flex items-center justify-center text-zinc-200 mx-auto mb-6">
              <Utensils size={40} />
            </div>
            <h3 className="text-xl font-black text-zinc-900 mb-2">Menu Kosong</h3>
            <p className="text-zinc-400 font-bold max-w-xs mx-auto">Tambahkan menu baru untuk mulai menggunakan sistem kasir.</p>
          </div>
        )}
      </div>

      <MenuModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editData={editData}
      />

      <ConfirmModal 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={handleDelete}
        title="Hapus Menu Makanan"
        message="Apakah Anda yakin ingin menghapus menu ini? Semua histori penjualan terkait menu ini akan hilang."
      />
    </>
  );
}
