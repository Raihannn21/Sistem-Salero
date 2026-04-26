"use client";

import React from "react";
import Image from "next/image";
import { X, Printer, Share2, Download, CheckCircle2 } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    id: string;
    date: Date;
    items: { name: string; quantity: number; price: number }[];
    totalAmount: number;
    paymentMethod: string;
    cashierName: string;
  } | null;
}

export default function ReceiptModal({ isOpen, onClose, data }: ReceiptModalProps) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-[380px] md:max-w-md animate-in zoom-in-95 slide-in-from-bottom-10 duration-700 ease-out max-h-[95vh] flex flex-col">
        
        {/* Action Buttons (Top) */}
        <div className="absolute -top-14 right-0 flex gap-2">
           <button onClick={onClose} className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-all">
             <X size={20} />
           </button>
        </div>

        {/* Receipt Container */}
        <div className="relative bg-white shadow-[0_30px_100px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden rounded-[2.5rem] border border-zinc-100">
          
          {/* Scrollable Receipt Content */}
          <div className="px-6 md:px-10 pt-10 md:pt-14 pb-12 md:pb-16 overflow-y-auto custom-scrollbar max-h-[75vh] md:max-h-none">
            
            {/* Header */}
            <div className="text-center space-y-2 mb-10">
              <div className="relative h-20 w-full mx-auto">
                <Image src="/salero-logo.png" alt="Salero Logo" fill className="object-contain" />
              </div>
              <div className="pt-2">
                <h2 className="text-2xl font-black text-zinc-900 tracking-tighter uppercase">Salero Bana</h2>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Masakan Padang Asli</p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-y-4 mb-10 border-y border-dashed border-zinc-200 py-6">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">ID Nota</p>
                <p className="text-xs font-black text-zinc-900">#{data.id.slice(-8).toUpperCase()}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Metode Bayar</p>
                <div className="flex items-center justify-end gap-2">
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-black uppercase",
                    data.paymentMethod === "QRIS" ? "bg-primary/10 text-primary" : "bg-zinc-100 text-zinc-600"
                  )}>
                    {data.paymentMethod}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Waktu</p>
                <p className="text-xs font-bold text-zinc-600">{format(data.date, "HH:mm, dd MMM yyyy", { locale: id })}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Kasir</p>
                <p className="text-xs font-bold text-zinc-600 uppercase">{data.cashierName}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-4 mb-10 min-h-[100px]">
              {data.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-xs font-black text-zinc-900 uppercase leading-tight">{item.name}</p>
                    <p className="text-[10px] font-bold text-zinc-400 mt-0.5">{item.quantity} x {formatCurrency(item.price / item.quantity)}</p>
                  </div>
                  <p className="text-xs font-black text-zinc-900">{formatCurrency(item.price)}</p>
                </div>
              ))}
            </div>

            {/* Total Section */}
            <div className="relative pt-6 border-t-2 border-zinc-900/10">
              {/* PAID STAMP - Repositioned over "Total Tagihan" text */}
              <div className="absolute -top-8 left-0 opacity-80 pointer-events-none rotate-[-12deg] animate-in zoom-in-150 duration-700 delay-300">
                <div className="relative h-24 w-24">
                  <Image src="/paid.png" alt="PAID" fill className="object-contain" />
                </div>
              </div>

              <div className="flex justify-between items-end relative z-10">
                <p className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Total Tagihan</p>
                <p className="text-3xl font-black text-primary tracking-tighter leading-none">{formatCurrency(data.totalAmount)}</p>
              </div>
            </div>

            {/* Footer Tagline */}
            <div className="mt-16 text-center">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">Terima Kasih Atas Kunjungannya</p>
            </div>
          </div>
        </div>

        {/* Action Buttons (Bottom) */}
        <div className="mt-8 grid grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-1000">
          <button 
            onClick={onClose}
            className="flex items-center justify-center gap-2 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-2xl font-black text-[10px] tracking-widest uppercase transition-all"
          >
            <X size={16} />
            Tutup
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl font-black text-[10px] tracking-widest uppercase shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Printer size={16} />
            Cetak Struk
          </button>
        </div>
      </div>
    </div>
  );
}
