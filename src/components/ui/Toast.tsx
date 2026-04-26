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
        <div className="fixed top-4 left-4 right-4 md:top-8 md:right-8 md:left-auto z-[200] flex flex-col gap-3 pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto relative flex items-center gap-4 p-4 md:p-5 rounded-2xl md:rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/20 backdrop-blur-2xl animate-in slide-in-from-top-4 md:slide-in-from-right-4 fade-in duration-500 w-full md:w-[400px]",
                toast.type === "success" && "bg-white/95 border-green-100 text-green-900",
                toast.type === "error" && "bg-white/95 border-red-100 text-red-900",
                toast.type === "info" && "bg-white/95 border-primary/10 text-primary"
              )}
            >
              {/* Icon Container */}
              <div className={cn(
                "h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center shrink-0",
                toast.type === "success" && "bg-green-50 text-green-600",
                toast.type === "error" && "bg-red-50 text-red-600",
                toast.type === "info" && "bg-primary/5 text-primary"
              )}>
                {toast.type === "success" && <CheckCircle2 size={24} />}
                {toast.type === "error" && <AlertCircle size={24} />}
                {toast.type === "info" && <Info size={24} />}
              </div>
              
              {/* Content Area */}
              <div className="flex-1 pr-6 min-w-0">
                <p className="text-[10px] md:text-xs font-black tracking-[0.1em] leading-tight uppercase opacity-60 mb-0.5">
                  {toast.type === "success" ? "Berhasil" : toast.type === "error" ? "Terjadi Kesalahan" : "Informasi"}
                </p>
                <p className="text-sm md:text-base font-bold tracking-tight leading-snug line-clamp-2">{toast.message}</p>
              </div>

              {/* Close Button */}
              <button 
                onClick={() => removeToast(toast.id)}
                className="absolute top-2 right-2 md:top-4 md:right-4 p-1.5 rounded-xl text-zinc-300 hover:text-zinc-500 hover:bg-zinc-50 transition-all"
              >
                <X size={18} />
              </button>

              {/* Progress Bar (Timer) */}
              <div className={cn(
                "absolute bottom-0 left-0 h-1 rounded-full bg-current opacity-20",
                "animate-[toast-progress_4s_linear_forwards]",
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
