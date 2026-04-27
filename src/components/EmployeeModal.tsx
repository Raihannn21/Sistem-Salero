"use client";

import React, { useState, useEffect, useCallback } from "react";
import Modal from "./ui/Modal";
import Input from "./ui/Input";
import { Button } from "./ui/Button";
import { User, Lock, Camera, X as CloseIcon, Check, RotateCcw } from "lucide-react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";

import { addEmployee, updateEmployee } from "@/actions/employees";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/Toast";

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: any | null;
}

export default function EmployeeModal({ isOpen, onClose, editData }: EmployeeModalProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    nik: "",
    address: "",
    emergencyContact: "",
    socialMedia: "",
    image: ""
  });

  // Cropping States
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    if (editData) {
      setFormData({
        username: editData.username || "",
        password: "", 
        fullName: editData.fullName || "",
        nik: editData.nik || "",
        address: editData.address || "",
        emergencyContact: editData.emergencyContact || "",
        socialMedia: editData.socialMedia || "",
        image: editData.image || ""
      });
    } else {
      setFormData({
        username: "",
        password: "",
        fullName: "",
        nik: "",
        address: "",
        emergencyContact: "",
        socialMedia: "",
        image: ""
      });
    }
    setTempImage(null);
  }, [editData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // Increase to 5MB for raw capture
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
        setFormData({ ...formData, image: croppedImage });
        setTempImage(null);
        showToast("Foto berhasil dipotong", "success");
      }
    } catch (e) {
      showToast("Gagal memproses foto", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (editData) {
        result = await updateEmployee(editData.id, formData);
      } else {
        result = await addEmployee(formData);
      }

      if (result.success) {
        showToast(
          editData ? "Data karyawan berhasil diperbarui." : "Karyawan baru berhasil didaftarkan.", 
          "success"
        );
        onClose();
        router.refresh();
      } else {
        showToast(result.error || "Gagal menyimpan data.", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan sistem.", "error");
    } finally {
      setLoading(false);
    }
  };

  const IconPlaceholder = <User size={18} />;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={tempImage ? "Sesuaikan Foto Profil" : (editData ? "Edit Data Karyawan" : "Daftarkan Karyawan Baru")}
    >
      {tempImage ? (
        /* CROPPER VIEW */
        <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="relative h-[350px] w-full bg-zinc-900 rounded-[2rem] overflow-hidden">
            <Cropper
              image={tempImage}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              cropShape="round"
              showGrid={false}
            />
          </div>
          
          <div className="space-y-4 px-4">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Zoom</span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 h-1.5 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setTempImage(null)}>
                BATAL
              </Button>
              <Button type="button" className="flex-[2] gap-2" onClick={handleCropSave}>
                <Check size={18} />
                TERAPKAN FOTO
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* FORM VIEW */
        <form onSubmit={handleSubmit} className="space-y-6 px-1">
          {/* Photo Upload Area */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative group">
              <div className="h-32 w-32 rounded-[2.5rem] bg-zinc-50 border-2 border-zinc-100 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/30 group-hover:bg-primary/5 shadow-inner">
                {formData.image ? (
                  <img src={formData.image} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <User size={48} className="text-zinc-200 group-hover:text-primary/30 transition-colors" />
                )}
              </div>
              
              <label className="absolute -bottom-2 -right-2 h-10 w-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center cursor-pointer shadow-xl hover:scale-110 active:scale-95 transition-all">
                <Camera size={18} />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>

              {formData.image && (
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, image: "" })}
                  className="absolute -top-2 -right-2 h-8 w-8 bg-white border border-zinc-100 text-zinc-400 rounded-lg flex items-center justify-center shadow-md hover:text-rose-500 transition-all"
                >
                  <CloseIcon size={14} />
                </button>
              )}
            </div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-4">Foto Profil Karyawan</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-50">
            <Input 
              label="Username Login" 
              name="username"
              placeholder="Username" 
              value={formData.username} 
              onChange={handleChange}
              icon={IconPlaceholder}
              required
            />
            <Input 
              label={editData ? "Password Baru" : "Password Awal"} 
              name="password"
              type="password" 
              placeholder="******" 
              value={formData.password} 
              onChange={handleChange}
              icon={<Lock size={18} />}
              required={!editData}
            />
          </div>

          <div className="space-y-6 pt-4 border-t border-zinc-50">
            <Input 
              label="Nama Lengkap Karyawan" 
              name="fullName"
              placeholder="Sesuai KTP" 
              value={formData.fullName} 
              onChange={handleChange}
              icon={IconPlaceholder}
              required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Nomor NIK" 
                name="nik"
                placeholder="NIK" 
                value={formData.nik} 
                onChange={handleChange}
                icon={IconPlaceholder}
              />
              <Input 
                label="Kontak Darurat" 
                name="emergencyContact"
                placeholder="No HP Keluarga" 
                value={formData.emergencyContact} 
                onChange={handleChange}
                icon={IconPlaceholder}
              />
            </div>

            <Input 
              label="Alamat" 
              name="address"
              placeholder="Alamat domisili" 
              value={formData.address} 
              onChange={handleChange}
              icon={IconPlaceholder}
            />

            <Input 
              label="Media Sosial" 
              name="socialMedia"
              placeholder="@username" 
              value={formData.socialMedia} 
              onChange={handleChange}
              icon={IconPlaceholder}
            />
          </div>

          <div className="flex items-center gap-4 pt-6 border-t border-zinc-50">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
              BATAL
            </Button>
            <Button type="submit" className="flex-[2]" isLoading={loading}>
              SIMPAN DATA
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
