"use client";

import React, { useState, useEffect } from "react";
// Gunakan import yang paling aman
import Modal from "./ui/Modal";
import Input from "./ui/Input";
import { Button } from "./ui/Button";
// Hapus semua ikon untuk sementara untuk memastikan rendering berhasil
import { User, Lock } from "lucide-react";

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
    socialMedia: ""
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        username: editData.username || "",
        password: "", 
        fullName: editData.fullName || "",
        nik: editData.nik || "",
        address: editData.address || "",
        emergencyContact: editData.emergencyContact || "",
        socialMedia: editData.socialMedia || ""
      });
    } else {
      setFormData({
        username: "",
        password: "",
        fullName: "",
        nik: "",
        address: "",
        emergencyContact: "",
        socialMedia: ""
      });
    }
  }, [editData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  // Gunakan Ikon User saja yang 100% pasti ada
  const IconPlaceholder = <User size={18} />;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editData ? "Edit Data Karyawan" : "Daftarkan Karyawan Baru"}
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            SIMPAN
          </Button>
        </div>
      </form>
    </Modal>
  );
}
