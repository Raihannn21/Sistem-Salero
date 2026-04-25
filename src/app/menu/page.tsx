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
    <div className="min-h-screen bg-[#fcfcfc] lg:pl-72">
      <Navigation />
      
      <main className="p-8 lg:p-12 max-w-[1600px] mx-auto animate-in">
        <header className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3 text-primary/60 font-black text-[10px] uppercase tracking-[0.3em] mb-3">
              <div className="h-[2px] w-8 bg-primary/40"></div>
              Katalog Produk
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-zinc-900 tracking-tight">Manajemen Menu</h1>
            <p className="text-zinc-500 font-semibold text-base mt-2">Analisis keuntungan dan HPP tiap porsi makanan.</p>
          </div>
          <button className="flex items-center gap-2.5 rounded-xl bg-primary px-7 py-3.5 font-bold text-white shadow-xl shadow-primary/20 hover:scale-[1.02] hover:bg-primary-hover active:scale-[0.98] transition-all text-sm tracking-wide">
            <Plus size={18} strokeWidth={2.5} />
            BUAT MENU BARU
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {menuWithHPP.map((menu) => (
            <div key={menu.id} className="group rounded-[2.5rem] bg-white p-8 transition-all flex flex-col border border-zinc-50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] hover:shadow-[0_30px_60px_-10px_rgba(128,0,0,0.12)] hover:-translate-y-2">
              <div className="flex items-start justify-between mb-8">
                <div className="h-16 w-16 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:shadow-primary/20">
                  <UtensilsCrossed size={28} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Harga Jual</p>
                  <p className="text-2xl font-black text-zinc-900 tracking-tighter">{formatCurrency(menu.basePrice)}</p>
                </div>
              </div>

              <h3 className="text-2xl font-black text-zinc-900 mb-2 tracking-tight group-hover:text-primary transition-colors">{menu.name}</h3>
              <p className="text-sm font-bold text-zinc-400 mb-8 line-clamp-2 leading-relaxed">{menu.description || "Tidak ada deskripsi resep untuk menu ini."}</p>

              <div className="mt-auto space-y-5">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50/50 border border-zinc-100">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Info size={14} className="text-primary/60" />
                    <span className="text-[10px] font-black uppercase tracking-widest">HPP Produksi</span>
                  </div>
                  <span className="text-sm font-black text-zinc-700 tracking-tight">{formatCurrency(menu.hpp)}</span>
                </div>

                <div className="flex items-center justify-between p-5 rounded-2xl bg-primary/[0.03] border border-primary/10">
                  <div className="flex items-center gap-2 text-primary">
                    <TrendingUp size={16} strokeWidth={3} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Profit Margin</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-lg font-black text-primary tracking-tighter">{formatCurrency(menu.margin)}</span>
                    <span className="text-[10px] font-black text-primary/60">{menu.marginPercent.toFixed(1)}% PER PORSI</span>
                  </div>
                </div>

                <button className="w-full flex items-center justify-center gap-2 py-4 text-xs font-black text-zinc-400 uppercase tracking-[0.2em] hover:text-primary transition-all group/btn">
                  DETAIL RESEP 
                  <ChevronRight size={16} strokeWidth={3} className="group-hover/btn:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>
          ))}

          {menuWithHPP.length === 0 && (
            <div className="col-span-full py-32 bg-white rounded-[3rem] border-dashed border-2 border-zinc-100 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="h-24 w-24 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-200 mb-6">
                <UtensilsCrossed size={48} />
              </div>
              <h3 className="text-xl font-black text-zinc-900 mb-2">Belum ada menu</h3>
              <p className="text-zinc-400 font-bold max-w-xs">Mulai dengan membuat menu baru dan tentukan resepnya untuk menghitung HPP.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
