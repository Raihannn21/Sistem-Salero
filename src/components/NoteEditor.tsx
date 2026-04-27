"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
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
  ChevronLeft,
  Trash2,
  ALargeSmall
} from "lucide-react";
import { Button } from "./ui/Button";
import { createNote, updateNote, deleteNote } from "@/actions/notes";
import { useToast } from "./ui/Toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ConfirmModal } from "./ui/ConfirmModal";

interface NoteEditorProps {
  initialNote?: {
    id: string;
    title: string;
    content: string;
  };
}

export default function NoteEditor({ initialNote }: NoteEditorProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [noteTitle, setNoteTitle] = useState(initialNote?.title || "");

  useEffect(() => {
    if (initialNote && editorRef.current) {
      editorRef.current.innerHTML = initialNote.content;
    }
  }, [initialNote]);

  const execCommand = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    if (editorRef.current) editorRef.current.focus();
  };

  const handleSave = async () => {
    if (!noteTitle.trim()) {
      showToast("Judul catatan tidak boleh kosong", "error");
      return;
    }

    setLoading(true);
    const content = editorRef.current?.innerHTML || "";

    try {
      if (initialNote) {
        const res = await updateNote(initialNote.id, noteTitle, content);
        if (res.success) {
          showToast("Catatan diperbarui", "success");
          router.push("/notes");
          router.refresh();
        }
      } else {
        const res = await createNote(noteTitle, content);
        if (res.success) {
          showToast("Catatan berhasil dibuat", "success");
          router.push("/notes");
          router.refresh();
        }
      }
    } catch (error) {
      showToast("Gagal menyimpan catatan", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialNote) return;
    try {
      const res = await deleteNote(initialNote.id);
      if (res.success) {
        showToast("Catatan dihapus", "success");
        router.push("/notes");
        router.refresh();
      }
    } catch (error) {
      showToast("Gagal menghapus", "error");
    }
  };

  return (
    <div className="flex flex-col gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 lg:pb-0 max-w-5xl mx-auto">
      
      {/* 1. TOP HEADER - STICKY FOR ACCESSIBILITY */}
      <div className="sticky top-0 z-20 bg-[#fcfcfc]/90 backdrop-blur-md py-4 flex flex-col gap-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push("/notes")}
              className="h-10 w-10 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all shadow-sm shrink-0"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl md:text-3xl font-black text-zinc-900 tracking-tight uppercase leading-none truncate">
              {initialNote ? "Edit Memo" : "Buat Memo"}
            </h1>
          </div>

          {/* Action Buttons Row - Positioned below title on mobile, flex on desktop */}
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="flex-1 h-12 px-6 rounded-xl bg-zinc-900 text-white shadow-xl shadow-zinc-900/10 font-black text-[10px] tracking-widest uppercase flex items-center justify-center gap-2"
            >
              {loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
              SIMPAN CATATAN
            </Button>

            {initialNote && (
              <button 
                onClick={() => setIsDeleting(true)}
                className="h-12 w-12 rounded-xl bg-rose-50 text-rose-300 hover:text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-all shrink-0 border border-rose-100"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>

        {/* 2. FLOATING TOOLBAR - NOW OUTSIDE THE CARD */}
        <div className="overflow-x-auto no-scrollbar-mobile py-1">
          <div className="flex items-center gap-2 min-w-max">
            <div className="flex items-center bg-white p-1 rounded-xl shadow-md border border-zinc-50">
              <ToolbarButton icon={Bold} onClick={() => execCommand("bold")} />
              <ToolbarButton icon={Italic} onClick={() => execCommand("italic")} />
              <ToolbarButton icon={Underline} onClick={() => execCommand("underline")} />
            </div>

            <div className="flex items-center bg-white p-1 rounded-xl shadow-md border border-zinc-50">
              <button onMouseDown={e => e.preventDefault()} onClick={() => execCommand("fontSize", "3")} className="h-9 px-3 flex items-center justify-center text-[10px] font-black text-zinc-400 hover:text-primary transition-colors">S</button>
              <button onMouseDown={e => e.preventDefault()} onClick={() => execCommand("fontSize", "5")} className="h-9 px-3 flex items-center justify-center text-[10px] font-black text-zinc-400 hover:text-primary transition-colors border-x border-zinc-50">M</button>
              <button onMouseDown={e => e.preventDefault()} onClick={() => execCommand("fontSize", "7")} className="h-9 px-3 flex items-center justify-center text-[10px] font-black text-zinc-400 hover:text-primary transition-colors">L</button>
            </div>

            <div className="flex items-center bg-white p-1 rounded-xl shadow-md border border-zinc-50">
              <ToolbarButton icon={List} onClick={() => execCommand("insertUnorderedList")} />
              <ToolbarButton icon={ListOrdered} onClick={() => execCommand("insertOrderedList")} />
            </div>

            <div className="flex items-center bg-white p-1 rounded-xl shadow-md border border-zinc-50">
              <ToolbarButton icon={AlignLeft} onClick={() => execCommand("justifyLeft")} />
              <ToolbarButton icon={AlignCenter} onClick={() => execCommand("justifyCenter")} />
              <ToolbarButton icon={AlignRight} onClick={() => execCommand("justifyRight")} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT AREA - CLEAN CARD */}
      <div className="flex flex-col bg-white rounded-[2.5rem] md:rounded-[3.5rem] border border-zinc-100 shadow-[0_30px_100px_rgba(0,0,0,0.04)] min-h-[550px] md:min-h-[750px]">
        <div className="flex-1 flex flex-col p-8 md:p-16 space-y-8 md:space-y-12">
          {/* TITLE INPUT - DARKER PLACEHOLDER */}
          <input 
            type="text" 
            placeholder="KETIK JUDUL MEMO DISINI..." 
            className="w-full text-3xl md:text-5xl font-black text-zinc-900 focus:outline-none placeholder:text-zinc-200 uppercase tracking-tighter"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
          />
          
          <div 
            ref={editorRef}
            contentEditable
            className="salero-editor flex-1 text-lg md:text-2xl text-zinc-600 focus:outline-none min-h-[400px] leading-relaxed"
            placeholder="Mulai tulis ide hebat Anda..."
          />
        </div>
      </div>

      <ConfirmModal 
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        onConfirm={handleDelete}
        title="HAPUS MEMO"
        message="Catatan ini akan dihapus selamanya. Apakah Anda yakin?"
      />

      <style jsx global>{`
        .no-scrollbar-mobile::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar-mobile {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .salero-editor {
          outline: none;
        }
        .salero-editor ul {
          list-style-type: disc !important;
          margin-left: 2rem !important;
          margin-top: 1rem !important;
          margin-bottom: 1rem !important;
          display: block !important;
        }
        .salero-editor ol {
          list-style-type: decimal !important;
          margin-left: 2rem !important;
          margin-top: 1rem !important;
          margin-bottom: 1rem !important;
          display: block !important;
        }
        .salero-editor li {
          display: list-item !important;
          margin-bottom: 0.5rem !important;
          padding-left: 0.5rem !important;
        }
        .salero-editor p {
          margin-bottom: 1.5rem !important;
        }
        .salero-editor b, .salero-editor strong {
          font-weight: 900 !important;
          color: #18181b;
        }
      `}</style>
    </div>
  );
}

function ToolbarButton({ icon: Icon, onClick }: { icon: any, onClick: () => void }) {
  return (
    <button 
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="h-9 w-9 md:h-11 md:w-11 flex items-center justify-center text-zinc-400 hover:text-primary hover:bg-primary/5 transition-all rounded-lg"
    >
      <Icon size={18} />
    </button>
  );
}
