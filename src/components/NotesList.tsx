"use client";

import React, { useState } from "react";
import { Plus, Search, StickyNote, ChevronRight, Clock, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: Date;
}

interface NotesListProps {
  notes: Note[];
}

export default function NotesList({ notes }: NotesListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to strip HTML tags for preview
  const getPreview = (html: string) => {
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > 120 ? text.substring(0, 120) + "..." : text;
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div className="space-y-1">
          <h1 className="text-5xl font-black text-zinc-900 tracking-tight leading-none">Catatan Pribadi</h1>
          <p className="text-xs font-black text-primary uppercase tracking-[0.4em] opacity-80">Ruang Inspirasi Salero Bana</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
          <div className="relative group flex-1 sm:w-80">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Cari ide atau memo..." 
              className="w-full bg-white border-2 border-zinc-50 text-zinc-900 pl-14 pr-6 py-4 rounded-3xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 shadow-sm transition-all font-bold placeholder:text-zinc-200 uppercase text-[10px] tracking-widest"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <button 
            onClick={() => router.push("/notes/new")}
            className="h-14 px-10 rounded-3xl bg-zinc-900 text-white shadow-2xl shadow-zinc-900/20 hover:bg-primary hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 font-black text-[10px] tracking-widest uppercase"
          >
            <Plus size={18} strokeWidth={3} />
            TAMBAH CATATAN
          </button>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredNotes.map((note) => (
          <div 
            key={note.id}
            onClick={() => router.push(`/notes/${note.id}`)}
            className="group relative bg-white rounded-[3rem] p-8 border-2 border-zinc-50 hover:border-primary shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-[0_30px_80px_rgba(180,0,0,0.1)] transition-all duration-500 cursor-pointer overflow-hidden flex flex-col min-h-[280px]"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="h-12 w-12 rounded-2xl bg-zinc-50 text-zinc-300 group-hover:bg-primary/5 group-hover:text-primary flex items-center justify-center transition-all duration-500">
                <StickyNote size={24} />
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-zinc-300 uppercase tracking-widest group-hover:text-zinc-500 transition-colors">
                <Calendar size={12} />
                {format(new Date(note.updatedAt), "dd MMM yyyy", { locale: id })}
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-2">
                {note.title || "Tanpa Judul"}
              </h3>
              <p className="text-sm text-zinc-500 font-medium leading-relaxed line-clamp-3">
                {getPreview(note.content) || "Belum ada isi catatan..."}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Baca Selengkapnya</span>
              <ChevronRight size={16} className="text-primary" />
            </div>

            {/* Subtle Gradient Reveal */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </div>
        ))}

        {filteredNotes.length === 0 && (
          <div className="col-span-full py-32 text-center bg-white rounded-[4rem] border-4 border-dashed border-zinc-50 flex flex-col items-center justify-center space-y-6">
            <div className="h-24 w-24 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-200">
              <StickyNote size={48} strokeWidth={1} />
            </div>
            <div className="space-y-2">
              <p className="text-xl font-black text-zinc-400 uppercase tracking-widest">Belum Ada Catatan</p>
              <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Mulai catat resep atau strategi bisnis Anda sekarang!</p>
            </div>
            <button 
              onClick={() => router.push("/notes/new")}
              className="mt-4 px-8 py-4 bg-zinc-900 text-white rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-primary transition-all"
            >
              Buat Catatan Pertama
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
