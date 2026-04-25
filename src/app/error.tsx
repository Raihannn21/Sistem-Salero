'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 lg:pl-64 text-center">
      <div className="h-20 w-20 rounded-3xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mb-6">
        <AlertTriangle size={40} />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Terjadi Kesalahan!</h2>
      <p className="text-zinc-500 max-w-md mb-8">
        Sistem mengalami kendala saat memuat data. Pastikan database sudah berjalan dan koneksi stabil.
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-800 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-all"
        >
          <RefreshCcw size={18} />
          Coba Lagi
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
}
