"use client";

import React, { useState, useEffect } from "react";
import Modal from "./ui/Modal";
import Input from "./ui/Input";
import { Button } from "./ui/Button";
import { Utensils, DollarSign } from "lucide-react";
import { addMenuItem, updateMenuItem } from "@/actions/menu";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/Toast";
import { MenuItem } from "@prisma/client";

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: MenuItem | null;
}

export default function MenuModal({ isOpen, onClose, editData }: MenuModalProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [basePrice, setBasePrice] = useState("");

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setBasePrice(editData.basePrice.toString());
    } else {
      setName("");
      setBasePrice("");
    }
  }, [editData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      name,
      basePrice: parseFloat(basePrice),
    };

    try {
      let result;
      if (editData) {
        result = await updateMenuItem(editData.id, data);
      } else {
        result = await addMenuItem(data);
      }

      if (result.success) {
        showToast(
          editData ? "Menu masakan berhasil diperbarui." : "Menu baru berhasil ditambahkan.", 
          "success"
        );
        onClose();
        router.refresh();
      } else {
        showToast(result.error || "Gagal menyimpan menu.", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Terjadi kesalahan sistem saat menyimpan menu.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editData ? "Edit Menu Masakan" : "Tambah Menu Baru"}
    >
      <form onSubmit={handleSubmit} className="space-y-10 py-4">
        <div className="grid grid-cols-1 gap-8">
          <Input 
            label="Nama Menu" 
            placeholder="Contoh: Nasi Rendang" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            icon={<Utensils size={18} />}
            required
          />
          <Input 
            label="Harga Jual (IDR)" 
            type="number" 
            placeholder="Contoh: 25000" 
            value={basePrice} 
            onChange={(e) => setBasePrice(e.target.value)}
            icon={<DollarSign size={18} />}
            required
          />
        </div>

        <div className="flex items-center gap-4 pt-6 border-t border-zinc-50">
          <Button type="button" variant="outline" className="flex-1 h-14" onClick={onClose} disabled={loading}>
            BATAL
          </Button>
          <Button type="submit" className="flex-[2] h-14 shadow-xl shadow-primary/20" isLoading={loading}>
            {editData ? "SIMPAN PERUBAHAN" : "SIMPAN MENU"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
