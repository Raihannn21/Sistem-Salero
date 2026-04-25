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
    <div className="min-h-screen bg-[#09090b] lg:pl-64">
      <Navigation />
      
      <main className="p-6 lg:p-10">
        <header className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Pencatatan Penjualan</h1>
            <p className="text-zinc-500">Catat menu yang terjual untuk memantau laba harian.</p>
          </div>
          <button className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <Plus size={20} />
            Input Penjualan
          </button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          {/* Quick Input Section */}
          <div className="xl:col-span-1 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Plus className="text-primary" size={20} />
              Input Cepat
            </h2>
            <div className="glass rounded-3xl p-6 border border-zinc-800">
              <p className="text-sm text-zinc-500 mb-6 text-center">Pilih menu di bawah ini untuk menambah penjualan secara cepat.</p>
              <div className="grid grid-cols-1 gap-3">
                {menuItems.map(item => (
                  <button key={item.id} className="w-full text-left p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-primary/50 transition-all group">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-200 group-hover:text-white">{item.name}</span>
                      <Plus size={16} className="text-zinc-600 group-hover:text-primary" />
                    </div>
                  </button>
                ))}
                {menuItems.length === 0 && (
                  <div className="text-center py-4 text-zinc-600 text-sm italic">
                    Belum ada menu. Buat menu dulu di tab "Menu".
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent History */}
          <div className="xl:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="text-primary" size={20} />
              Riwayat Penjualan Terakhir
            </h2>
            <div className="glass rounded-3xl overflow-hidden border border-zinc-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/50">
                      <th className="px-6 py-5 text-sm font-bold text-zinc-400">Waktu</th>
                      <th className="px-6 py-5 text-sm font-bold text-zinc-400">Menu</th>
                      <th className="px-6 py-5 text-sm font-bold text-zinc-400">Qty</th>
                      <th className="px-6 py-5 text-sm font-bold text-zinc-400 text-right">Total Pendapatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {recentSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-zinc-900/30 transition-colors">
                        <td className="px-6 py-5 text-zinc-500 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            {format(new Date(sale.date), "HH:mm, dd MMM", { locale: id })}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-white font-bold">{sale.menuItem.name}</td>
                        <td className="px-6 py-5 text-zinc-400 font-medium">{sale.quantity} porsi</td>
                        <td className="px-6 py-5 text-right font-bold text-primary">
                          Rp {sale.totalPrice.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {recentSales.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-20 text-center text-zinc-500">
                          Belum ada transaksi hari ini.
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
