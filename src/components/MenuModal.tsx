"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "./ui/Modal";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Plus, Trash2, Utensils, DollarSign, FileText } from "lucide-react";
import { addMenuItem, updateMenuItem } from "@/actions/menu";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/Toast";

import { Ingredient, MenuItem, RecipeItem } from "@prisma/client";

interface Recipe {
  ingredientId: string;
  quantity: number;
}

type MenuItemWithRecipes = MenuItem & {
  recipes: RecipeItem[];
};

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredients: Ingredient[];
  editData?: MenuItemWithRecipes | null;
}

export default function MenuModal({ isOpen, onClose, ingredients, editData }: MenuModalProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([{ ingredientId: "", quantity: 0 }]);

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setDescription(editData.description || "");
      setBasePrice(editData.basePrice.toString());
      setRecipes(editData.recipes.map((r: RecipeItem) => ({
        ingredientId: r.ingredientId,
        quantity: r.quantity
      })));
    } else {
      setName("");
      setDescription("");
      setBasePrice("");
      setRecipes([{ ingredientId: "", quantity: 0 }]);
    }
  }, [editData, isOpen]);

  const addRecipeRow = () => {
    setRecipes([...recipes, { ingredientId: "", quantity: 0 }]);
  };

  const removeRecipeRow = (index: number) => {
    setRecipes(recipes.filter((_, i) => i !== index));
  };

  const updateRecipe = (index: number, field: keyof Recipe, value: any) => {
    const newRecipes = [...recipes];
    newRecipes[index] = { ...newRecipes[index], [field]: value };
    setRecipes(newRecipes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      name,
      description,
      basePrice: parseFloat(basePrice),
      recipes: recipes.filter(r => r.ingredientId && r.quantity > 0)
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
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="Nama Menu" 
            placeholder="Contoh: Nasi Goreng Gila" 
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

        <div className="space-y-2">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Deskripsi Resep</label>
          <div className="relative group">
            <FileText className="absolute left-5 top-5 text-zinc-300 group-focus-within:text-primary transition-colors" size={18} />
            <textarea 
              className="w-full bg-zinc-50 border border-zinc-100 text-zinc-900 pl-14 pr-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold placeholder:text-zinc-300 min-h-[100px]"
              placeholder="Jelaskan singkat isi porsi menu ini..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Recipe Builder */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Komposisi Bahan (Resep)</label>
            <Button type="button" variant="ghost" size="sm" onClick={addRecipeRow} className="text-primary hover:bg-primary/5">
              <Plus size={14} strokeWidth={3} />
              TAMBAH BAHAN
            </Button>
          </div>

          <div className="space-y-3">
            {recipes.map((row, index) => (
              <div key={index} className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex-1">
                  <select 
                    className="w-full bg-zinc-50 border border-zinc-100 text-zinc-900 px-5 py-3.5 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold"
                    value={row.ingredientId}
                    onChange={(e) => updateRecipe(index, "ingredientId", e.target.value)}
                    required
                  >
                    <option value="">Pilih Bahan...</option>
                    {ingredients.map(ing => (
                      <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                    ))}
                  </select>
                </div>
                <div className="w-32 relative group">
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="Qty" 
                    className="w-full bg-zinc-50 border border-zinc-100 text-zinc-900 pl-4 pr-12 py-3.5 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-left"
                    value={row.quantity || ""}
                    onChange={(e) => updateRecipe(index, "quantity", parseFloat(e.target.value))}
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-zinc-400 uppercase tracking-tighter">
                    {ingredients.find(ing => ing.id === row.ingredientId)?.recipeUnit || ingredients.find(ing => ing.id === row.ingredientId)?.unit || "Qty"}
                  </span>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeRecipeRow(index)}
                  className="p-3 text-zinc-300 hover:text-red-500 hover:bg-red-50"
                  disabled={recipes.length === 1}
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
            BATAL
          </Button>
          <Button type="submit" className="flex-[2]" isLoading={loading}>
            {editData ? "SIMPAN PERUBAHAN" : "TAMBAH MENU SEKARANG"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
