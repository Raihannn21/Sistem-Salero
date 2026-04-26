import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";
import { prisma } from "@/lib/prisma";
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign,
  UtensilsCrossed,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { startOfDay, endOfDay } from "date-fns";

async function getStats() {
  const today = new Date();
  
  const [salesData, expensesData, menuItemsCount] = await Promise.all([
    prisma.sale.findMany({
      where: {
        date: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        }
      }
    }),
    prisma.expense.findMany({
      where: {
        date: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        }
      }
    }),
    prisma.menuItem.count(),
  ]);

  const totalRevenue = salesData.reduce((acc, sale) => acc + sale.totalPrice, 0);
  const totalExpenses = expensesData.reduce((acc, exp) => acc + exp.amount, 0);
  const totalProfit = totalRevenue - totalExpenses;

  return {
    totalRevenue,
    totalExpenses,
    totalProfit,
    salesCount: salesData.length,
    menuItemsCount,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Security: If not OWNER, redirect to Sales (Cashier)
  if ((session.user as any).role !== "OWNER") {
    redirect("/sales");
  }

  const stats = await getStats();

  return (
    <div className="min-h-screen bg-[#fcfcfc] lg:pl-72">
      <Navigation />
      
      <main className="p-8 lg:p-12 max-w-[1600px] mx-auto animate-in">
        <PageHeader 
          category="Ringkasan Arus Kas"
          title={`Halo, ${session.user?.name}! 👋`}
          description="Pantau keuntungan bersih hari ini berdasarkan omzet dan biaya belanja."
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <StatCard 
            title="Omzet Hari Ini" 
            value={formatCurrency(stats.totalRevenue)} 
            icon={<DollarSign size={24} />}
            trend={{ value: 100, isUp: true }}
          />
          <StatCard 
            title="Biaya Belanja" 
            value={formatCurrency(stats.totalExpenses)} 
            icon={<ArrowDownRight size={24} />}
            variant="zinc"
          />
          <StatCard 
            title="Untung Bersih" 
            value={formatCurrency(stats.totalProfit)} 
            icon={<TrendingUp size={24} />}
            variant="primary"
            trend={{ value: 100, isUp: stats.totalProfit >= 0 }}
          />
          <StatCard 
            title="Menu Terjual" 
            value={stats.salesCount.toString()} 
            icon={<ShoppingCart size={24} />}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          {/* Main Visual Logic */}
          <Card className="xl:col-span-2">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Kesehatan Bisnis</h3>
                <p className="text-sm font-bold text-zinc-400 mt-1">Perbandingan Pemasukan vs Pengeluaran Hari Ini.</p>
              </div>
            </div>

            <div className="space-y-12">
              {/* Revenue Progress */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                      <ArrowUpRight size={18} strokeWidth={3} />
                    </div>
                    <span className="text-sm font-black text-zinc-600 uppercase tracking-widest">Pemasukan (Sales)</span>
                  </div>
                  <span className="font-black text-zinc-900">{formatCurrency(stats.totalRevenue)}</span>
                </div>
                <div className="h-4 w-full bg-zinc-50 rounded-full overflow-hidden border border-zinc-100 p-1">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(34,197,94,0.4)]" 
                    style={{ width: stats.totalRevenue > 0 ? '100%' : '0%' }}
                  ></div>
                </div>
              </div>

              {/* Expense Progress */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                      <ArrowDownRight size={18} strokeWidth={3} />
                    </div>
                    <span className="text-sm font-black text-zinc-600 uppercase tracking-widest">Pengeluaran (Belanja)</span>
                  </div>
                  <span className="font-black text-zinc-900">{formatCurrency(stats.totalExpenses)}</span>
                </div>
                <div className="h-4 w-full bg-zinc-50 rounded-full overflow-hidden border border-zinc-100 p-1">
                  <div 
                    className="h-full bg-red-500 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(239,68,68,0.4)]" 
                    style={{ width: `${Math.min((stats.totalExpenses / (stats.totalRevenue || 1)) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="xl:col-span-1">
            <h3 className="text-xl font-black text-zinc-900 mb-10 tracking-tight">Status Operasional</h3>
            <div className="p-8 rounded-[2.5rem] bg-zinc-50 border border-zinc-100 text-center">
              <div className="h-20 w-20 rounded-[2rem] bg-white shadow-xl shadow-zinc-200/50 flex items-center justify-center text-primary mx-auto mb-6">
                <UtensilsCrossed size={40} />
              </div>
              <h4 className="text-lg font-black text-zinc-900 mb-2">{stats.menuItemsCount} Menu Aktif</h4>
              <p className="text-xs font-bold text-zinc-400 leading-relaxed px-4">
                Sistem menghitung keuntungan berdasarkan selisih penjualan dan biaya belanja pasar Anda hari ini.
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
