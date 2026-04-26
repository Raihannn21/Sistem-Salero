"use client";

import React, { useState } from "react";
import { PageHeader } from "./ui/PageHeader";
import { Button } from "./ui/Button";
import { Plus, User, Trash2, Edit2, Shield, Phone, Package } from "lucide-react";
import { Card } from "./ui/Card";
import EmployeeModal from "./EmployeeModal";
import { deleteEmployee } from "@/actions/employees";
import { useToast } from "./ui/Toast";
import { ConfirmModal } from "./ui/ConfirmModal";

interface EmployeeControllerProps {
  employees: any[];
}

export default function EmployeeController({ employees }: EmployeeControllerProps) {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any | null>(null);

  const handleEdit = (item: any) => {
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
      const result = await deleteEmployee(selectedId);
      if (result.success) {
        showToast("Karyawan berhasil dihapus.", "success");
      }
    } finally {
      setSelectedId(null);
      setIsConfirmOpen(false);
    }
  };

  return (
    <>
      <PageHeader
        category="Personalia"
        title="Daftar Karyawan"
        description="Kelola data pribadi dan akun login karyawan kasir Anda."
        action={
          <Button onClick={handleAdd}>
            <Plus size={18} strokeWidth={2.5} />
            TAMBAH KARYAWAN
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {employees.map((emp) => (
          <Card key={emp.id} padding="none" className="group overflow-hidden hover:border-primary/20 transition-all">
            <div className="p-8">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-[2rem] bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-300 group-hover:bg-primary/5 group-hover:border-primary/20 group-hover:text-primary transition-all duration-500">
                    <User size={36} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-zinc-900 tracking-tight">{emp.fullName || emp.username}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Shield size={14} className="text-primary" />
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">Karyawan Kasir</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl border border-zinc-100 bg-white shadow-sm" onClick={() => handleEdit(emp)}>
                    <Edit2 size={16} />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl border border-zinc-100 bg-white shadow-sm text-red-500 hover:bg-red-50" onClick={() => openDeleteConfirm(emp.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-zinc-50">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">NIK</p>
                  <p className="font-bold text-zinc-700">{emp.nik || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Username Login</p>
                  <p className="font-bold text-zinc-700">@{emp.username}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Kontak Darurat</p>
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="text-zinc-300" />
                    <p className="font-bold text-zinc-700">{emp.emergencyContact || "-"}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Alamat</p>
                  <div className="flex items-center gap-2">
                    <Package size={12} className="text-zinc-300" />
                    <p className="font-bold text-zinc-700 truncate">{emp.address || "-"}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {employees.length === 0 && (
          <div className="col-span-full py-32 text-center bg-zinc-50/50 rounded-[3rem] border border-dashed border-zinc-200">
            <h3 className="text-xl font-black text-zinc-900 mb-2">Belum Ada Karyawan</h3>
            <p className="text-zinc-400 font-bold">Daftarkan karyawan pertama Anda untuk memberikan akses kasir.</p>
          </div>
        )}
      </div>

      <EmployeeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editData={editData}
      />

      <ConfirmModal 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={handleDelete}
        title="Hapus Karyawan"
        message="Apakah Anda yakin ingin menghapus akses karyawan ini? Mereka tidak akan bisa login lagi ke sistem."
      />
    </>
  );
}
