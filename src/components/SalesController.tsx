"use client";

import React from "react";
import { Plus, ShoppingCart, History, Calendar } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { recordSale } from "@/actions/sales";
import { useToast } from "./ui/Toast";
import { useRouter } from "next/navigation";

interface SalesControllerProps {
  menuItems: any[];
  recentSales: any[];
}

export default function SalesController({ menuItems, recentSales }: SalesControllerProps) {
  const { showToast } = useToast();
  const router = useRouter();

  const handleQuickSale = async (menuItemId: string, menuName: string) => {
    const formData = new FormData();
    formData.append("menuItemId", menuItemId);
    formData.append("quantity", "1");

    try {
      const result = await recordSale(formData);
      if (result.success) {
        showToast(`Berhasil mencatat penjualan: ${menuName}`, "success");
        router.refresh();
      } else {
        showToast(result.error || "Gagal mencatat penjualan.", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan sistem.", "error");
    }
  };

  return (
    <>
      <PageHeader 
        category="Revenue Tracker"
        title="Pencatatan Penjualan"
        description="Catat menu yang terjual untuk memantau laba harian."
        action={
          <Button onClick={() => showToast("Fitur input manual sedang dikembangkan.", "info")}>
            <Plus size={18} strokeWidth={2.5} />
            INPUT PENJUALAN
          </Button>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        {/* Quick Input Section */}
        <div className="xl:col-span-1 space-y-8">
          <h2 className="text-xl font-extrabold text-zinc-900 flex items-center gap-3 tracking-tight">
            <Plus className="text-primary" size={24} strokeWidth={3} />
            Input Cepat
          </h2>
          <Card padding="md">
            <p className="text-xs font-bold text-zinc-400 mb-8 text-center uppercase tracking-widest leading-loose">Pilih menu untuk menambah penjualan secara cepat</p>
            <div className="grid grid-cols-1 gap-4">
              {menuItems.map(item => (
                <button 
                  key={item.id} 
                  onClick={() => handleQuickSale(item.id, item.name)}
                  className="w-full text-left p-5 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-primary/30 hover:bg-primary/5 transition-all group flex items-center justify-between"
                >
                  <span className="font-bold text-zinc-700 group-hover:text-primary transition-colors tracking-tight">{item.name}</span>
                  <div className="h-8 w-8 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-300 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                    <Plus size={16} strokeWidth={3} />
                  </div>
                </button>
              ))}
              {menuItems.length === 0 && (
                <div className="text-center py-12">
                  <div className="h-16 w-16 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-200 mx-auto mb-4">
                    <ShoppingCart size={32} />
                  </div>
                  <p className="text-zinc-400 font-bold text-sm">Belum ada menu terdaftar.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Recent History */}
        <div className="xl:col-span-2 space-y-8">
          <h2 className="text-xl font-extrabold text-zinc-900 flex items-center gap-3 tracking-tight">
            <History className="text-primary" size={24} strokeWidth={3} />
            Riwayat Terakhir
          </h2>
          <Card padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-50 bg-zinc-50/30">
                    <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Waktu Transaksi</th>
                    <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Menu Terjual</th>
                    <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Kuantitas</th>
                    <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Total (IDR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {recentSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-zinc-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3 text-zinc-400 font-bold text-xs uppercase tracking-wider">
                          <div className="h-8 w-8 rounded-xl bg-zinc-50 flex items-center justify-center text-primary/40 group-hover:text-primary transition-colors">
                            <Calendar size={14} />
                          </div>
                          {format(new Date(sale.date), "HH:mm, dd MMM", { locale: id })}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-zinc-900 font-bold tracking-tight">{sale.menuItem.name}</td>
                      <td className="px-8 py-6 text-zinc-500 font-bold">{sale.quantity} porsi</td>
                      <td className="px-8 py-6 text-right font-black text-primary text-lg tracking-tighter">
                        Rp {sale.totalPrice.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {recentSales.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-32 text-center">
                        <div className="h-20 w-20 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-200 mx-auto mb-4">
                          <History size={40} />
                        </div>
                        <p className="text-zinc-500 font-bold">Belum ada transaksi hari ini.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
