"use client";

import React from "react";
import Modal from "./Modal";
import { Button } from "./Button";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
}

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "HAPUS", 
  cancelText = "BATAL",
  variant = "danger"
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center text-center py-6">
        <div className={`h-20 w-20 rounded-full flex items-center justify-center mb-6 ${
          variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-primary/5 text-primary'
        }`}>
          <AlertTriangle size={40} strokeWidth={2.5} />
        </div>
        <p className="text-zinc-500 font-bold leading-relaxed max-w-sm mb-10">
          {message}
        </p>
        
        <div className="flex items-center gap-4 w-full">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button 
            className={`flex-1 ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : ''}`} 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
