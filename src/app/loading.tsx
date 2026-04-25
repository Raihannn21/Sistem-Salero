import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#fdfdfd] flex flex-col items-center justify-center lg:pl-72">
      <div className="relative">
        <div className="h-24 w-24 rounded-[2rem] bg-white border border-zinc-100 flex items-center justify-center shadow-xl shadow-zinc-200/50 animate-pulse">
          <Loader2 className="text-primary animate-spin" size={40} />
        </div>
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-max">
          <p className="text-xs font-black text-zinc-400 uppercase tracking-widest animate-pulse">Memuat data Salero...</p>
        </div>
      </div>
    </div>
  );
}
