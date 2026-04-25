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
    <div className="min-h-screen bg-[#fdfdfd] flex flex-col items-center justify-center p-6 lg:pl-72 text-center">
      <div className="h-24 w-24 rounded-[2rem] bg-red-50 border border-red-100 flex items-center justify-center text-red-500 mb-8 shadow-xl shadow-red-100/50">
        <AlertTriangle size={48} />
      </div>
      <h2 className="text-3xl font-black text-zinc-900 mb-3">Terjadi Kesalahan!</h2>
      <p className="text-zinc-500 font-medium max-w-md mb-10">
        Sistem mengalami kendala saat memuat data. Pastikan database sudah berjalan dan koneksi stabil.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-white border border-zinc-200 text-zinc-900 font-bold rounded-2xl hover:bg-zinc-50 hover:border-zinc-300 shadow-sm transition-all"
        >
          <RefreshCcw size={18} />
          Coba Lagi
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="px-8 py-4 bg-primary text-white font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/20 transition-all"
        >
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
}
