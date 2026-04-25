import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center lg:pl-64">
      <div className="relative">
        <div className="h-24 w-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse">
          <Loader2 className="text-primary animate-spin" size={40} />
        </div>
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-max">
          <p className="text-sm font-medium text-zinc-500 animate-pulse">Memuat data Salero...</p>
        </div>
      </div>
    </div>
  );
}
