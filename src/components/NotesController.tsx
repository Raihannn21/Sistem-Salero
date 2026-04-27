"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Save, 
  Bold, 
  Italic, 
  Underline, 
  Type, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Search,
  StickyNote,
  ChevronRight,
  MoreVertical,
  X
} from "lucide-react";
import { Button } from "./ui/Button";
import { createNote, updateNote, deleteNote } from "@/actions/notes";
import { useToast } from "./ui/Toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ConfirmModal } from "./ui/ConfirmModal";

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: Date;
}

interface NotesControllerProps {
  initialNotes: Note[];
}

export default function NotesController({ initialNotes }: NotesControllerProps) {
  const { showToast } = useToast();
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [noteTitle, setNoteTitle] = useState("");

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const execCommand = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    if (editorRef.current) editorRef.current.focus();
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setNoteTitle("");
    if (editorRef.current) editorRef.current.innerHTML = "";
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setNoteTitle(note.title);
    if (editorRef.current) editorRef.current.innerHTML = note.content;
  };

  const handleSave = async () => {
    if (!noteTitle.trim()) {
      showToast("Judul catatan tidak boleh kosong", "error");
      return;
    }

    setLoading(true);
    const content = editorRef.current?.innerHTML || "";

    try {
      if (selectedNote) {
        const res = await updateNote(selectedNote.id, noteTitle, content);
        if (res.success) {
          setNotes(prev => prev.map(n => n.id === selectedNote.id ? { ...n, title: noteTitle, content, updatedAt: new Date() } : n));
          showToast("Catatan diperbarui", "success");
        }
      } else {
        const res = await createNote(noteTitle, content);
        if (res.success) {
          // Refresh list would be better but let's simulate for instant feedback
          window.location.reload(); 
        }
      }
    } catch (error) {
      showToast("Gagal menyimpan catatan", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) return;
    try {
      const res = await deleteNote(isDeleting);
      if (res.success) {
        setNotes(prev => prev.filter(n => n.id !== isDeleting));
        if (selectedNote?.id === isDeleting) {
          handleNewNote();
        }
        showToast("Catatan dihapus", "success");
      }
    } catch (error) {
      showToast("Gagal menghapus", "error");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-200px)] -m-8 lg:-m-12 p-8 lg:p-12 bg-[#fcfcfc]">
      
      {/* Sidebar List */}
      <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Catatan</h1>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Owner Private Memos</p>
        </div>

        <Button 
          onClick={handleNewNote}
          className="w-full h-16 rounded-[2rem] bg-zinc-900 text-white shadow-xl shadow-zinc-900/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 font-black text-[10px] tracking-widest uppercase"
        >
          <Plus size={18} />
          BUAT CATATAN BARU
        </Button>

        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-primary transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Cari catatan..." 
            className="w-full bg-white border border-zinc-100 text-zinc-900 pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 shadow-sm transition-all text-xs font-bold uppercase tracking-widest placeholder:text-zinc-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2 max-h-[400px] lg:max-h-none">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              onClick={() => handleSelectNote(note)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleSelectNote(note);
              }}
              className={cn(
                "w-full text-left p-6 rounded-3xl border transition-all duration-300 group relative overflow-hidden cursor-pointer outline-none focus:ring-2 focus:ring-primary/20",
                selectedNote?.id === note.id 
                  ? "bg-white border-primary shadow-xl shadow-primary/5" 
                  : "bg-white border-zinc-100 hover:border-zinc-300 shadow-sm"
              )}
            >
              <div className="flex justify-between items-start mb-2 relative z-10">
                <h3 className={cn(
                  "font-black text-sm uppercase tracking-tight truncate flex-1 pr-4",
                  selectedNote?.id === note.id ? "text-primary" : "text-zinc-900"
                )}>
                  {note.title || "Tanpa Judul"}
                </h3>
                <button 
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDeleting(note.id);
                  }}
                  className="h-8 w-8 rounded-lg bg-rose-50 text-rose-300 hover:text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest relative z-10">
                {format(new Date(note.updatedAt), "dd MMM yyyy", { locale: id })}
              </p>
              {selectedNote?.id === note.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary z-10" />
              )}
            </div>
          ))}

          {filteredNotes.length === 0 && (
            <div className="py-20 text-center bg-zinc-50/50 rounded-[2.5rem] border border-dashed border-zinc-200">
              <StickyNote size={32} className="mx-auto text-zinc-200 mb-4" />
              <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Belum ada catatan</p>
            </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col bg-white rounded-[3.5rem] border border-zinc-100 shadow-2xl shadow-zinc-200/50 overflow-hidden min-h-[600px]">
        
        {/* Toolbar */}
        <div className="p-6 border-b border-zinc-50 bg-zinc-50/30 flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-white p-1 rounded-xl shadow-sm border border-zinc-100">
            <ToolbarButton icon={Bold} onClick={() => execCommand("bold")} title="Tebal" />
            <ToolbarButton icon={Italic} onClick={() => execCommand("italic")} title="Miring" />
            <ToolbarButton icon={Underline} onClick={() => execCommand("underline")} title="Garis Bawah" />
          </div>

          <div className="h-6 w-px bg-zinc-200 mx-2" />

          <div className="flex items-center bg-white p-1 rounded-xl shadow-sm border border-zinc-100">
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCommand("fontSize", "3")} 
              className="px-3 py-2 text-[10px] font-black text-zinc-400 hover:text-primary uppercase tracking-widest transition-colors"
            >
              Small
            </button>
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCommand("fontSize", "5")} 
              className="px-3 py-2 text-[10px] font-black text-zinc-400 hover:text-primary uppercase tracking-widest transition-colors"
            >
              Normal
            </button>
            <button 
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => execCommand("fontSize", "7")} 
              className="px-3 py-2 text-[10px] font-black text-zinc-400 hover:text-primary uppercase tracking-widest transition-colors"
            >
              Large
            </button>
          </div>

          <div className="h-6 w-px bg-zinc-200 mx-2" />

          <div className="flex items-center bg-white p-1 rounded-xl shadow-sm border border-zinc-100">
            <ToolbarButton icon={List} onClick={() => execCommand("insertUnorderedList")} />
            <ToolbarButton icon={ListOrdered} onClick={() => execCommand("insertOrderedList")} />
          </div>

          <div className="h-6 w-px bg-zinc-200 mx-2" />

          <div className="flex items-center bg-white p-1 rounded-xl shadow-sm border border-zinc-100">
            <ToolbarButton icon={AlignLeft} onClick={() => execCommand("justifyLeft")} />
            <ToolbarButton icon={AlignCenter} onClick={() => execCommand("justifyCenter")} />
            <ToolbarButton icon={AlignRight} onClick={() => execCommand("justifyRight")} />
          </div>

          <div className="ml-auto flex items-center gap-4">
             <Button 
                onClick={handleSave} 
                disabled={loading}
                className="h-12 px-8 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 font-black text-[10px] tracking-widest uppercase flex items-center gap-2"
              >
                {loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                SIMPAN CATATAN
             </Button>
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-1 flex flex-col p-10 lg:p-16 space-y-8 overflow-y-auto custom-scrollbar">
          <input 
            type="text" 
            placeholder="JUDUL CATATAN..." 
            className="w-full text-4xl font-black text-zinc-900 focus:outline-none placeholder:text-zinc-100 uppercase tracking-tighter"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
          />
          
          <div 
            ref={editorRef}
            contentEditable
            className="flex-1 text-lg text-zinc-600 focus:outline-none min-h-[300px] prose prose-zinc max-w-none prose-p:my-2"
            placeholder="Tulis sesuatu yang hebat di sini..."
          />
        </div>
      </div>

      <ConfirmModal 
        isOpen={!!isDeleting}
        onClose={() => setIsDeleting(null)}
        onConfirm={handleDelete}
        title="HAPUS CATATAN"
        message="Apakah Anda yakin ingin menghapus catatan ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
}

function ToolbarButton({ icon: Icon, onClick, title }: { icon: any, onClick: () => void, title?: string }) {
  return (
    <button 
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className="h-10 w-10 flex items-center justify-center text-zinc-400 hover:text-primary hover:bg-primary/5 transition-all rounded-lg"
    >
      <Icon size={18} />
    </button>
  );
}
