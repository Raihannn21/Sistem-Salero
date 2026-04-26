"use client";

import React, { useState } from "react";
import { PageHeader } from "./ui/PageHeader";
import { Button } from "./ui/Button";
import { Plus, Search, Package, Trash2, Edit2, Layers } from "lucide-react";
import { Card } from "./ui/Card";
import { formatCurrency } from "@/lib/utils";
import IngredientModal from "./IngredientModal";
import { deleteIngredient } from "@/actions/ingredients";
import { useToast } from "./ui/Toast";
import { ConfirmModal } from "./ui/ConfirmModal";

import { Ingredient } from "@prisma/client";

interface IngredientControllerProps {
  ingredients: Ingredient[];
}

export default function IngredientController({ ingredients }: IngredientControllerProps) {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Ingredient | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleEdit = (ing: Ingredient) => {
    setEditData(ing);
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
      const result = await deleteIngredient(selectedId);
      if (result.success) {
        showToast("Bahan baku berhasil dihapus.", "success");
      } else {
        showToast(result.error || "Gagal menghapus bahan baku.", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan sistem saat menghapus data.", "error");
    } finally {
      setSelectedId(null);
    }
  };

  const filteredItems = ingredients.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <PageHeader 
        category="Cost Management"
        title="Daftar Harga Bahan"
        description="Kelola harga beli dan konversi untuk perhitungan HPP."
        action={
          <Button onClick={handleAdd}>
            <Plus size={18} strokeWidth={2.5} />
            TAMBAH BAHAN
          </Button>
        }
      />

      {/* Search Bar */}
      <div className="mb-10 relative max-w-md group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Cari nama bahan..."
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
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Bahan Baku</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Satuan Beli</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Konversi Resep</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Harga Beli</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredItems.map((item) => (
                <tr key={item.id} className="group hover:bg-zinc-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-500">
                        <Package size={20} />
                      </div>
                      <p className="font-bold text-zinc-900 tracking-tight">{item.name}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-zinc-500 font-bold text-sm uppercase tracking-wider">{item.unit}</span>
                  </td>
                  <td className="px-8 py-6">
                    {item.recipeUnit ? (
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/5 text-primary">
                          <Layers size={14} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-zinc-900 font-bold text-sm">1 {item.unit} = {item.recipeYield} {item.recipeUnit}</span>
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-1 opacity-60">
                            {formatCurrency(item.pricePerUnit / (item.recipeYield || 1))} / {item.recipeUnit}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-zinc-300 font-bold text-xs italic">Tanpa Konversi</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-zinc-900 font-black tracking-tight">{formatCurrency(item.pricePerUnit)}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-2 h-10 w-10 rounded-xl text-zinc-400 hover:text-primary hover:bg-primary/5 border border-zinc-100 bg-white"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit2 size={18} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-2 h-10 w-10 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 border border-zinc-100 bg-white"
                        onClick={() => openDeleteConfirm(item.id)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredItems.length === 0 && (
          <div className="p-32 text-center">
            <div className="h-20 w-20 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-200 mx-auto mb-6">
              <Package size={40} />
            </div>
            <h3 className="text-xl font-black text-zinc-900 mb-2">Bahan Tidak Ditemukan</h3>
            <p className="text-zinc-400 font-bold max-w-xs mx-auto">Silakan tambahkan bahan baku baru untuk mulai mengelola harga.</p>
          </div>
        )}
      </Card>

      <IngredientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editData={editData}
      />

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Bahan Baku"
        message="Apakah Anda yakin ingin menghapus bahan baku ini? Tindakan ini tidak dapat dibatalkan dan akan berpengaruh pada resep menu yang menggunakan bahan ini."
      />
    </>
  );
}
