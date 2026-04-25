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
    <div className="min-h-screen bg-[#09090b] lg:pl-64">
      <Navigation />
      
      <main className="p-6 lg:p-10">
        <header className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Stok Bahan Baku</h1>
            <p className="text-zinc-500">Kelola harga dan stok semua bahan masakan.</p>
          </div>
          <button className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <Plus size={20} />
            Tambah Bahan
          </button>
        </header>

        {/* Search & Filters */}
        <div className="mb-8 relative max-w-md">
          <Search className="absolute left-4 top-3.5 text-zinc-500" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama bahan..."
            className="w-full bg-zinc-900 border border-zinc-800 text-white pl-12 pr-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Table/List */}
        <div className="glass rounded-3xl overflow-hidden border border-zinc-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="px-6 py-5 text-sm font-bold text-zinc-400">Nama Bahan</th>
                  <th className="px-6 py-5 text-sm font-bold text-zinc-400">Unit</th>
                  <th className="px-6 py-5 text-sm font-bold text-zinc-400">Harga/Unit</th>
                  <th className="px-6 py-5 text-sm font-bold text-zinc-400">Stok</th>
                  <th className="px-6 py-5 text-sm font-bold text-zinc-400 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {ingredients.map((item) => (
                  <tr key={item.id} className="group hover:bg-zinc-900/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:border-primary/50 transition-colors">
                          <Package size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-white">{item.name}</p>
                          {item.stock <= item.minStock && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                              <AlertCircle size={10} /> Stok Menipis
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-zinc-400 font-medium">{item.unit}</td>
                    <td className="px-6 py-5 text-white font-bold">{formatCurrency(item.pricePerUnit)}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${item.stock <= item.minStock ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-primary shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></div>
                        <span className="text-white font-bold">{item.stock}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {ingredients.length === 0 && (
            <div className="p-20 text-center">
              <Package className="mx-auto text-zinc-800 mb-4" size={48} />
              <p className="text-zinc-500">Belum ada bahan baku yang terdaftar.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
