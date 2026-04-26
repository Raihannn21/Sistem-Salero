"use client";

import React, { useState, useEffect } from "react";
import Modal from "./ui/Modal";
import Input from "./ui/Input";
import { Button } from "./ui/Button";
import { ShoppingCart, Hash, Utensils } from "lucide-react";
import { recordSale, updateSale } from "@/actions/sales";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/Toast";
import { MenuItem } from "@prisma/client";

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  editData?: any | null;
}

export default function SaleModal({ isOpen, onClose, menuItems, editData }: SaleModalProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [menuItemId, setMenuItemId] = useState("");
  const [quantity, setQuantity] = useState("1");

  useEffect(() => {
    if (editData) {
      setMenuItemId(editData.menuItemId);
      setQuantity(editData.quantity.toString());
    } else {
      setMenuItemId("");
      setQuantity("1");
    }
  }, [editData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (editData) {
        result = await updateSale(editData.id, { quantity: parseInt(quantity) });
      } else {
        const formData = new FormData();
        formData.append("menuItemId", menuItemId);
        formData.append("quantity", quantity);
        result = await recordSale(formData);
      }

      if (result.success) {
        showToast(
          editData ? "Transaksi berhasil diperbarui." : "Penjualan berhasil dicatat.", 
          "success"
        );
        onClose();
        router.refresh();
      } else {
        showToast(result.error || "Gagal menyimpan transaksi.", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan sistem.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editData ? "Edit Transaksi Penjualan" : "Input Penjualan Manual"}
    >
      <form onSubmit={handleSubmit} className="space-y-8 py-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Pilih Menu</label>
          <div className="relative group">
            <Utensils className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors" size={18} />
            <select 
              className="w-full bg-zinc-50 border border-zinc-100 text-zinc-900 pl-14 pr-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold appearance-none cursor-pointer"
              value={menuItemId}
              onChange={(e) => setMenuItemId(e.target.value)}
              disabled={!!editData}
              required
            >
              <option value="">Pilih salah satu menu...</option>
              {menuItems.map(item => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>
        </div>

        <Input 
          label="Jumlah (Porsi/Potong)" 
          type="number" 
          placeholder="Contoh: 1" 
          value={quantity} 
          onChange={(e) => setQuantity(e.target.value)}
          icon={<Hash size={18} />}
          required
        />

        <div className="flex items-center gap-4 pt-6 border-t border-zinc-50">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
            BATAL
          </Button>
          <Button type="submit" className="flex-[2] shadow-xl shadow-primary/20" isLoading={loading}>
            {editData ? "UPDATE TRANSAKSI" : "SIMPAN PENJUALAN"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
