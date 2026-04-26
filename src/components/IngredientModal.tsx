"use client";

import React, { useState, useEffect } from "react";
import Modal from "./ui/Modal";
import Input from "./ui/Input";
import { Button } from "./ui/Button";
import { Package, DollarSign, Scale, Layers } from "lucide-react";
import { addIngredient, updateIngredient } from "@/actions/ingredients";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/Toast";

import { Ingredient } from "@prisma/client";

interface IngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: Ingredient | null;
}

export default function IngredientModal({ isOpen, onClose, editData }: IngredientModalProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [recipeUnit, setRecipeUnit] = useState("");
  const [recipeYield, setRecipeYield] = useState("1");

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setUnit(editData.unit);
      setPricePerUnit(editData.pricePerUnit.toString());
      setRecipeUnit(editData.recipeUnit || "");
      setRecipeYield(editData.recipeYield?.toString() || "1");
    } else {
      setName("");
      setUnit("");
      setPricePerUnit("");
      setRecipeUnit("");
      setRecipeYield("1");
    }
  }, [editData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      name,
      unit,
      pricePerUnit: parseFloat(pricePerUnit),
      recipeUnit: recipeUnit || null,
      recipeYield: parseFloat(recipeYield) || 1,
    };

    try {
      let result;
      if (editData) {
        result = await updateIngredient(editData.id, data);
      } else {
        result = await addIngredient(data);
      }

      if (result.success) {
        showToast(
          editData ? "Bahan baku berhasil diperbarui." : "Bahan baku baru berhasil ditambahkan.", 
          "success"
        );
        onClose();
        router.refresh();
      } else {
        showToast(result.error || "Gagal menyimpan data.", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Terjadi kesalahan sistem saat menyimpan data.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editData ? "Edit Bahan Baku" : "Tambah Bahan Baku Baru"}
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Nama Bahan" 
            placeholder="Contoh: Daging Sapi" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            icon={<Package size={18} />}
            required
          />
          <Input 
            label="Harga Beli (IDR)" 
            type="number" 
            placeholder="Contoh: 120000" 
            value={pricePerUnit} 
            onChange={(e) => setPricePerUnit(e.target.value)}
            icon={<DollarSign size={18} />}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Satuan Beli" 
            placeholder="Contoh: kg, Box, Renteng" 
            value={unit} 
            onChange={(e) => setUnit(e.target.value)}
            icon={<Scale size={18} />}
            required
          />
        </div>

        {/* Conversion Section */}
        <div className="p-8 rounded-[2rem] bg-primary/5 border border-primary/10 space-y-6">
          <div className="flex items-center gap-3">
            <Layers className="text-primary" size={20} strokeWidth={3} />
            <h3 className="text-sm font-black text-primary uppercase tracking-widest">Konversi Satuan Resep</h3>
          </div>
          <p className="text-xs font-bold text-zinc-500 leading-relaxed">
            Gunakan ini agar Anda bisa memasukkan resep per potong/biji, bukan per kg. 
            Contoh: 1 kg Daging = 10 Potong.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <Input 
              label="Satuan di Resep" 
              placeholder="Contoh: Potong, Biji, Sachet" 
              value={recipeUnit} 
              onChange={(e) => setRecipeUnit(e.target.value)}
              className="bg-white"
            />
            <Input 
              label={`Isi per 1 ${unit || 'Satuan'}`} 
              type="number" 
              placeholder="Contoh: 10" 
              value={recipeYield} 
              onChange={(e) => setRecipeYield(e.target.value)}
              className="bg-white"
            />
          </div>
          {recipeUnit && recipeYield && (
            <div className="bg-white/50 p-4 rounded-xl text-[10px] font-black text-primary uppercase tracking-widest text-center">
              1 {unit} {name || 'Bahan'} = {recipeYield} {recipeUnit}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 pt-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
            BATAL
          </Button>
          <Button type="submit" className="flex-[2]" isLoading={loading}>
            {editData ? "SIMPAN PERUBAHAN" : "SIMPAN BAHAN BAKU"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
