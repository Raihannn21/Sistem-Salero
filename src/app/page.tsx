import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";
import { prisma } from "@/lib/prisma";
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Package,
  History,
  Activity,
  Zap,
  Target
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import DashboardCharts from "@/components/DashboardCharts";
import RealTimeClock from "@/components/RealTimeClock";
import { startOfDay, endOfDay, format, subDays } from "date-fns";
import { id } from "date-fns/locale";

async function getStats() {
  const today = new Date();
  
  // Last 7 days chart data (Sales & Expenses)
  const chartDataRaw = await Promise.all(
    Array.from({ length: 7 }).map(async (_, i) => {
      const date = subDays(today, 6 - i);
      const [sales, expenses] = await Promise.all([
        prisma.sale.findMany({
          where: { date: { gte: startOfDay(date), lte: endOfDay(date) } }
        }),
        prisma.expense.findMany({
          where: { date: { gte: startOfDay(date), lte: endOfDay(date) } }
        })
      ]);
      
      return {
        name: format(date, 'EEE', { locale: id }),
        omzet: sales.reduce((acc, s) => acc + s.totalPrice, 0),
        pengeluaran: expenses.reduce((acc, e) => acc + e.amount, 0)
      };
    })
  );

  const [salesData, expensesData, menuItemsCount, topSellingData, recentTransactions] = await Promise.all([
    prisma.sale.findMany({
      where: {
        date: { gte: startOfDay(today), lte: endOfDay(today) }
      },
      include: { menuItem: true }
    }),
    prisma.expense.findMany({
      where: {
        date: { gte: startOfDay(today), lte: endOfDay(today) }
      }
    }),
    prisma.menuItem.count(),
    prisma.sale.groupBy({
      by: ['menuItemId'],
      where: { date: { gte: startOfDay(today), lte: endOfDay(today) } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    }),
    prisma.transaction.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { 
        user: { select: { fullName: true, username: true } },
        sales: { include: { menuItem: true } }
      }
    })
  ]);

  const totalRevenue = salesData.reduce((acc, sale) => acc + sale.totalPrice, 0);
  const totalExpenses = expensesData.reduce((acc, exp) => acc + exp.amount, 0);
  const totalProfit = totalRevenue - totalExpenses;

  const topSelling = await Promise.all(topSellingData.map(async (item) => {
    const menu = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } });
    return {
      name: menu?.name || "Unknown",
      count: item._sum.quantity || 0
    };
  }));

  return {
    totalRevenue,
    totalExpenses,
    totalProfit,
    salesCount: salesData.length,
    menuItemsCount,
    topSelling,
    recentTransactions,
    chartData: chartDataRaw
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if ((session.user as any).role !== "OWNER") {
    redirect("/sales");
  }

  const stats = await getStats();

  return (
    <div className="min-h-screen bg-[#fcfcfc] lg:pl-72 relative">
      <Navigation />
      
      <main className="p-8 lg:p-12 max-w-[1600px] mx-auto animate-in">
        <div className="mb-12 flex flex-col xl:flex-row xl:items-end justify-between gap-8">
          <div>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Salero Smart Dashboard</p>
            <h1 className="text-4xl font-black text-zinc-900 tracking-tight leading-tight">Halo, {session.user?.name}! 👋</h1>
          </div>
          <RealTimeClock />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="p-8 rounded-[2.5rem] bg-zinc-900 text-white shadow-xl shadow-zinc-900/10 group overflow-hidden relative">
            <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-125 transition-transform duration-700">
              <DollarSign size={100} />
            </div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Omzet Hari Ini</p>
            <h2 className="text-2xl font-black tracking-tight">{formatCurrency(stats.totalRevenue)}</h2>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-white border border-zinc-100 shadow-sm">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Pengeluaran</p>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">{formatCurrency(stats.totalExpenses)}</h2>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-white border-2 border-primary/10 shadow-sm">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">Profit Bersih</p>
            <h2 className="text-2xl font-black text-primary tracking-tight">{formatCurrency(stats.totalProfit)}</h2>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-zinc-50 border border-zinc-100 shadow-inner">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Porsi Terjual</p>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">{stats.salesCount} Porsi</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          <div className="xl:col-span-8 space-y-10">
            <DashboardCharts data={stats.chartData} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <Card className="rounded-[3rem] border border-zinc-50 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-10 w-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                    <Package size={20} />
                  </div>
                  <h3 className="text-lg font-black text-zinc-900 tracking-tight">Paling Laris</h3>
                </div>
                <div className="space-y-6">
                  {stats.topSelling.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="font-bold text-zinc-600">{item.name}</span>
                      <span className="text-xs font-black text-zinc-900">{item.count} Sold</span>
                    </div>
                  ))}
                  {stats.topSelling.length === 0 && <p className="text-center py-8 text-zinc-300 font-bold italic">Belum ada jualan</p>}
                </div>
              </Card>

              <Card className="rounded-[3rem] border border-zinc-50 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-10 w-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
                    <Target size={20} />
                  </div>
                  <h3 className="text-lg font-black text-zinc-900 tracking-tight">Rasio Profit</h3>
                </div>
                <div className="space-y-6">
                  <div className="flex justify-between text-[10px] font-black uppercase text-zinc-400">
                    <span>Target Efisiensi</span>
                    <span className="text-primary">{Math.round((stats.totalProfit / (stats.totalRevenue || 1)) * 100)}%</span>
                  </div>
                  <div className="h-3 w-full bg-zinc-50 rounded-full overflow-hidden border border-zinc-100">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${Math.max(0, (stats.totalProfit / (stats.totalRevenue || 1)) * 100)}%` }} />
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div className="xl:col-span-4">
            <Card padding="none" className="rounded-[3rem] border border-zinc-100 shadow-sm overflow-hidden h-full">
              <div className="p-8 border-b border-zinc-50 bg-zinc-50/50">
                <h3 className="text-lg font-black text-zinc-900 tracking-tight">Transaksi Terakhir</h3>
              </div>
              <div className="divide-y divide-zinc-50">
                {stats.recentTransactions.map((tx) => (
                  <div key={tx.id} className="p-6 hover:bg-zinc-50/30 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-black text-zinc-900 text-sm group-hover:text-primary transition-colors">Rp {tx.totalAmount.toLocaleString()}</p>
                      <span className="text-[10px] font-black text-zinc-300 uppercase">{format(new Date(tx.createdAt), 'HH:mm')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={12} className="text-zinc-300" />
                      <span className="text-xs font-bold text-zinc-400">{tx.user.fullName || tx.user.username}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-8 mt-auto">
                <a href="/sales" className="w-full h-12 bg-zinc-900 text-white rounded-xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-colors shadow-lg shadow-zinc-200">
                  BUKA KASIR
                </a>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
