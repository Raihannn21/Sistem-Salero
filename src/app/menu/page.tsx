import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";
import { prisma } from "@/lib/prisma";
import { 
  UtensilsCrossed, 
  Plus, 
  ChevronRight,
  TrendingUp,
  Info
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function MenuPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const menuItems = await prisma.menuItem.findMany({
    include: {
      recipes: {
        include: {
          ingredient: true
        }
      }
    }
  });

  const menuWithHPP = menuItems.map(item => {
    const hpp = item.recipes.reduce((acc, recipe) => {
      const ingredientPrice = recipe.ingredient.pricePerUnit || 0;
      const quantity = recipe.quantity || 0;
      return acc + (ingredientPrice * quantity);
    }, 0);
    
    const margin = item.basePrice - hpp;
    const marginPercent = item.basePrice > 0 ? (margin / item.basePrice) * 100 : 0;
    
    return { ...item, hpp, margin, marginPercent };
  });

  return (
    <div className="min-h-screen bg-[#09090b] lg:pl-64">
      <Navigation />
      
      <main className="p-6 lg:p-10">
        <header className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Manajemen Menu</h1>
            <p className="text-zinc-500">Analisis keuntungan dan HPP tiap porsi makanan.</p>
          </div>
          <button className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <Plus size={20} />
            Buat Menu Baru
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {menuWithHPP.map((menu) => (
            <div key={menu.id} className="glass group rounded-3xl p-6 transition-all hover:bg-zinc-900/50 flex flex-col border border-zinc-800 hover:border-primary/30">
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <UtensilsCrossed size={24} />
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Harga Jual</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(menu.basePrice)}</p>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">{menu.name}</h3>
              <p className="text-sm text-zinc-500 mb-6 line-clamp-2">{menu.description || "Tidak ada deskripsi."}</p>

              <div className="mt-auto space-y-4">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Info size={14} />
                    <span className="text-xs font-medium">HPP Produksi</span>
                  </div>
                  <span className="text-sm font-bold text-zinc-200">{formatCurrency(menu.hpp)}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2 text-primary">
                    <TrendingUp size={14} />
                    <span className="text-xs font-bold">Margin Keuntungan</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-bold text-primary">{formatCurrency(menu.margin)}</span>
                    <span className="text-[10px] font-bold text-primary/70">{menu.marginPercent.toFixed(1)}% dari harga jual</span>
                  </div>
                </div>

                <button className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-zinc-400 hover:text-white transition-colors group">
                  Detail Resep 
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}

          {menuWithHPP.length === 0 && (
            <div className="col-span-full py-20 glass rounded-3xl border-dashed border-2 border-zinc-800 flex flex-col items-center justify-center text-center">
              <UtensilsCrossed className="text-zinc-800 mb-4" size={48} />
              <p className="text-zinc-500 max-w-xs">Belum ada menu yang dibuat. Mulai dengan membuat menu dan tentukan resepnya.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
