"use client";

import React, { useState, useEffect, useCallback } from "react";
import Modal from "./ui/Modal";
import Input from "./ui/Input";
import { Button } from "./ui/Button";
import { Utensils, DollarSign, Camera, X as CloseIcon, Check, User } from "lucide-react";
import { addMenuItem, updateMenuItem } from "@/actions/menu";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/Toast";
import { MenuItem } from "@prisma/client";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";

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
  const [basePrice, setBasePrice] = useState(""); // Raw numeric string
  const [image, setImage] = useState("");

  // Cropping States
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setBasePrice(editData.basePrice.toString());
      setImage((editData as any).image || "");
    } else {
      setName("");
      setBasePrice("");
      setImage("");
    }
    setTempImage(null);
  }, [editData, isOpen]);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("Ukuran foto terlalu besar (maks 5MB)", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = async () => {
    try {
      if (tempImage && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(tempImage, croppedAreaPixels);
        setImage(croppedImage);
        setTempImage(null);
        showToast("Foto menu berhasil dipotong", "success");
      }
    } catch (e) {
      showToast("Gagal memproses foto", "error");
    }
  };

  const formatDisplayAmount = (value: string) => {
    if (!value) return "";
    const number = parseInt(value.replace(/\D/g, ""));
    if (isNaN(number)) return "";
    return number.toLocaleString("id-ID");
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setBasePrice(rawValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !basePrice) return;
    
    setLoading(true);

    const data = {
      name,
      basePrice: parseFloat(basePrice),
      image
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
      title={tempImage ? "Sesuaikan Foto Menu" : (editData ? "Edit Menu Masakan" : "Tambah Menu Baru")}
    >
      {tempImage ? (
        /* CROPPER VIEW */
        <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="relative h-[300px] w-full bg-zinc-900 rounded-[2rem] overflow-hidden">
            <Cropper
              image={tempImage}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              cropShape="rect"
              showGrid={false}
            />
          </div>
          
          <div className="space-y-4 px-4 pb-4">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Zoom</span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1 h-14" onClick={() => setTempImage(null)}>
                BATAL
              </Button>
              <Button type="button" className="flex-[2] h-14 gap-2" onClick={handleCropSave}>
                <Check size={18} />
                TERAPKAN FOTO
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* FORM VIEW */
        <form onSubmit={handleSubmit} className="space-y-8 py-4">
          {/* Photo Upload Area */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative group">
              <div className="h-36 w-36 rounded-[2.5rem] bg-zinc-50 border-2 border-zinc-100 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/30 group-hover:bg-primary/5 shadow-inner">
                {image ? (
                  <img src={image} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <Utensils size={48} className="text-zinc-200 group-hover:text-primary/30 transition-colors" />
                )}
              </div>
              
              <label className="absolute -bottom-2 -right-2 h-10 w-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center cursor-pointer shadow-xl hover:scale-110 active:scale-95 transition-all">
                <Camera size={18} />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>

              {image && (
                <button 
                  type="button"
                  onClick={() => setImage("")}
                  className="absolute -top-2 -right-2 h-8 w-8 bg-white border border-zinc-100 text-zinc-400 rounded-lg flex items-center justify-center shadow-md hover:text-rose-500 transition-all"
                >
                  <CloseIcon size={14} />
                </button>
              )}
            </div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-4">Foto Menu Masakan</p>
          </div>

          <div className="grid grid-cols-1 gap-8 pt-4 border-t border-zinc-50">
            <Input 
              label="Nama Menu" 
              placeholder="Contoh: Nasi Rendang" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              icon={<Utensils size={18} />}
              required
            />
            <div className="space-y-1">
              <Input 
                label="Harga Jual (IDR)" 
                type="text" 
                inputMode="numeric"
                placeholder="Contoh: 25.000" 
                value={formatDisplayAmount(basePrice)} 
                onChange={handlePriceChange}
                icon={<DollarSign size={18} />}
                required
              />
              {basePrice && parseInt(basePrice) >= 1000000 && (
                <p className="text-[10px] font-bold text-primary ml-1 mt-2 italic animate-in fade-in slide-in-from-top-1">
                  Terbaca: Rp {(parseInt(basePrice) / 1000000).toFixed(1)} Juta
                </p>
              )}
            </div>
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
      )}
    </Modal>
  );
}
