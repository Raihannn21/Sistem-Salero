import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";
import { prisma } from "@/lib/prisma";
import { 
  Package, 
  Plus, 
  Search, 
  MoreVertical,
  AlertCircle
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function IngredientsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const ingredients = await prisma.ingredient.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="min-h-screen bg-[#fcfcfc] lg:pl-72">
      <Navigation />
      
      <main className="p-8 lg:p-12 max-w-[1600px] mx-auto animate-in">
        <header className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3 text-primary/60 font-black text-[10px] uppercase tracking-[0.3em] mb-3">
              <div className="h-[2px] w-8 bg-primary/40"></div>
              Inventory Control
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-zinc-900 tracking-tight">Stok Bahan Baku</h1>
            <p className="text-zinc-500 font-semibold text-base mt-2">Kelola harga dan stok semua bahan masakan.</p>
          </div>
          <button className="flex items-center gap-2.5 rounded-xl bg-primary px-7 py-3.5 font-bold text-white shadow-xl shadow-primary/20 hover:scale-[1.02] hover:bg-primary-hover active:scale-[0.98] transition-all text-sm tracking-wide">
            <Plus size={18} strokeWidth={2.5} />
            TAMBAH BAHAN
          </button>
        </header>

        {/* Search & Filters */}
        <div className="mb-10 relative max-w-md group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Cari nama bahan..."
            className="w-full bg-white border border-zinc-100 text-zinc-900 pl-14 pr-6 py-5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 shadow-sm transition-all font-bold placeholder:text-zinc-300"
          />
        </div>

        {/* Table/List */}
        <div className="bg-white rounded-[2.5rem] overflow-hidden border border-zinc-50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-50 bg-zinc-50/30">
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Bahan Baku</th>
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Unit</th>
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Harga Satuan</th>
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Status Stok</th>
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {ingredients.map((item) => (
                  <tr key={item.id} className="group hover:bg-zinc-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:text-primary transition-all duration-500">
                          <Package size={20} />
                        </div>
                        <div>
                          <p className="font-black text-zinc-900 tracking-tight">{item.name}</p>
                          {item.stock <= item.minStock && (
                            <span className="inline-flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-[0.1em] bg-primary/5 px-2 py-1 rounded-lg mt-1.5 border border-primary/10">
                              <AlertCircle size={10} strokeWidth={3} /> Stok Menipis
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-zinc-500 font-bold text-sm uppercase tracking-wider">{item.unit}</td>
                    <td className="px-8 py-6 text-zinc-900 font-black tracking-tight">{formatCurrency(item.pricePerUnit)}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`h-2.5 w-2.5 rounded-full ${item.stock <= item.minStock ? 'bg-primary animate-pulse shadow-[0_0_12px_rgba(128,0,0,0.4)]' : 'bg-primary/20'}`}></div>
                        <span className="text-zinc-900 font-black tracking-tighter text-lg">{item.stock}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2.5 text-zinc-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                        <MoreVertical size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {ingredients.length === 0 && (
            <div className="p-32 text-center">
              <div className="h-20 w-20 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-200 mx-auto mb-6">
                <Package size={40} />
              </div>
              <h3 className="text-xl font-black text-zinc-900 mb-2">Inventori Kosong</h3>
              <p className="text-zinc-400 font-bold max-w-xs mx-auto">Silakan tambahkan bahan baku baru untuk mulai mengelola stok Anda.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
