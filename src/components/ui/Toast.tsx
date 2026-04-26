"use client";

import React, { useState, useEffect, createContext, useContext, useCallback } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {mounted && createPortal(
        <div className="fixed top-8 right-8 z-[200] flex flex-col gap-4 max-w-md w-full">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={cn(
                "group relative flex items-center gap-4 p-5 rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.1)] border animate-in slide-in-from-top-full fade-in duration-500 backdrop-blur-xl",
                toast.type === "success" && "bg-white/95 border-green-100 text-green-900",
                toast.type === "error" && "bg-white/95 border-red-100 text-red-900",
                toast.type === "info" && "bg-white/95 border-primary/10 text-primary"
              )}
            >
              <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                toast.type === "success" && "bg-green-50 text-green-600",
                toast.type === "error" && "bg-red-50 text-red-600",
                toast.type === "info" && "bg-primary/5 text-primary"
              )}>
                {toast.type === "success" && <CheckCircle2 size={20} />}
                {toast.type === "error" && <AlertCircle size={20} />}
                {toast.type === "info" && <Info size={20} />}
              </div>
              
              <div className="flex-1 pr-6">
                <p className="text-sm font-black tracking-tight leading-tight uppercase">
                  {toast.type === "success" ? "Berhasil" : toast.type === "error" ? "Terjadi Kesalahan" : "Informasi"}
                </p>
                <p className="text-[13px] font-bold opacity-70 mt-0.5">{toast.message}</p>
              </div>

              <button 
                onClick={() => removeToast(toast.id)}
                className="absolute top-4 right-4 p-1 rounded-lg text-zinc-300 hover:text-zinc-500 hover:bg-zinc-50 transition-all"
              >
                <X size={16} />
              </button>

              <div className={cn(
                "absolute bottom-0 left-0 h-1 bg-current opacity-20 animate-toast-progress",
                toast.type === "success" && "bg-green-500",
                toast.type === "error" && "bg-red-500",
                toast.type === "info" && "bg-primary"
              )} />
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};
