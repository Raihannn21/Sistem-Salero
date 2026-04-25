import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";
import { prisma } from "@/lib/prisma";
import { 
  ShoppingCart, 
  Plus, 
  History,
  TrendingUp,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default async function SalesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const [menuItems, recentSales] = await Promise.all([
    prisma.menuItem.findMany(),
    prisma.sale.findMany({
      take: 10,
      orderBy: { date: 'desc' },
      include: { menuItem: true }
    })
  ]);

  return (
    <div className="min-h-screen bg-[#fcfcfc] lg:pl-72">
      <Navigation />
      
      <main className="p-8 lg:p-12 max-w-[1600px] mx-auto animate-in">
        <header className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3 text-primary/60 font-black text-[10px] uppercase tracking-[0.3em] mb-3">
              <div className="h-[2px] w-8 bg-primary/40"></div>
              Revenue Tracker
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-zinc-900 tracking-tight">Pencatatan Penjualan</h1>
            <p className="text-zinc-500 font-semibold text-base mt-2">Catat menu yang terjual untuk memantau laba harian.</p>
          </div>
          <button className="flex items-center gap-2.5 rounded-xl bg-primary px-7 py-3.5 font-bold text-white shadow-xl shadow-primary/20 hover:scale-[1.02] hover:bg-primary-hover active:scale-[0.98] transition-all text-sm tracking-wide">
            <Plus size={18} strokeWidth={2.5} />
            INPUT PENJUALAN
          </button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          {/* Quick Input Section */}
          <div className="xl:col-span-1 space-y-8">
            <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-3 tracking-tight">
              <Plus className="text-primary" size={24} strokeWidth={3} />
              Input Cepat
            </h2>
            <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)]">
              <p className="text-xs font-bold text-zinc-400 mb-8 text-center uppercase tracking-widest leading-loose">Pilih menu untuk menambah penjualan secara cepat</p>
              <div className="grid grid-cols-1 gap-4">
                {menuItems.map(item => (
                  <button key={item.id} className="w-full text-left p-5 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-primary/30 hover:bg-primary/5 transition-all group flex items-center justify-between">
                    <span className="font-black text-zinc-700 group-hover:text-primary transition-colors tracking-tight">{item.name}</span>
                    <div className="h-8 w-8 rounded-xl bg-white border border-zinc-100 flex items-center justify-center text-zinc-300 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                      <Plus size={16} strokeWidth={3} />
                    </div>
                  </button>
                ))}
                {menuItems.length === 0 && (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-200 mx-auto mb-4">
                      <ShoppingCart size={32} />
                    </div>
                    <p className="text-zinc-400 font-bold text-sm">Belum ada menu terdaftar.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent History */}
          <div className="xl:col-span-2 space-y-8">
            <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-3 tracking-tight">
              <History className="text-primary" size={24} strokeWidth={3} />
              Riwayat Terakhir
            </h2>
            <div className="bg-white rounded-[2.5rem] overflow-hidden border border-zinc-50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zinc-50 bg-zinc-50/30">
                      <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Waktu Transaksi</th>
                      <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Menu Terjual</th>
                      <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Kuantitas</th>
                      <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] text-right">Total (IDR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {recentSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-zinc-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3 text-zinc-400 font-bold text-xs uppercase tracking-wider">
                            <div className="h-8 w-8 rounded-xl bg-zinc-50 flex items-center justify-center text-primary/40 group-hover:text-primary transition-colors">
                              <Calendar size={14} />
                            </div>
                            {format(new Date(sale.date), "HH:mm, dd MMM", { locale: id })}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-zinc-900 font-black tracking-tight">{sale.menuItem.name}</td>
                        <td className="px-8 py-6 text-zinc-500 font-bold">{sale.quantity} porsi</td>
                        <td className="px-8 py-6 text-right font-black text-primary text-lg tracking-tighter">
                          Rp {sale.totalPrice.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {recentSales.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-32 text-center">
                          <div className="h-20 w-20 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-200 mx-auto mb-4">
                            <History size={40} />
                          </div>
                          <p className="text-zinc-500 font-black">Belum ada transaksi hari ini.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
