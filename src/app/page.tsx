import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";
import { prisma } from "@/lib/prisma";
import { 
  TrendingUp, 
  AlertTriangle, 
  ShoppingCart, 
  DollarSign,
  ArrowUpRight,
  Package
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

async function getStats() {
  const [salesCount, ingredients, ingredientsCount] = await Promise.all([
    prisma.sale.count(),
    prisma.ingredient.findMany({
      select: { stock: true, minStock: true }
    }),
    prisma.ingredient.count(),
  ]);

  const lowStockCount = ingredients.filter(i => i.stock <= i.minStock).length;

  const salesData = await prisma.sale.findMany({
    select: { totalPrice: true },
  });

  const totalRevenue = salesData.reduce((acc, sale) => acc + sale.totalPrice, 0);

  return {
    totalRevenue,
    salesCount,
    lowStockCount,
    ingredientsCount
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const stats = await getStats();

  return (
    <div className="min-h-screen bg-[#09090b] lg:pl-64">
      <Navigation />
      
      <main className="p-6 lg:p-10">
        <header className="mb-10 flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-white">Halo, {session.user?.name}! 👋</h1>
          <p className="text-zinc-500">Berikut adalah ringkasan bisnis Salero hari ini.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
          <StatCard 
            title="Total Pendapatan" 
            value={formatCurrency(stats.totalRevenue)} 
            icon={<DollarSign className="text-primary" />} 
            trend="+12%"
          />
          <StatCard 
            title="Total Penjualan" 
            value={stats.salesCount.toString()} 
            icon={<ShoppingCart className="text-blue-500" />} 
          />
          <StatCard 
            title="Stok Rendah" 
            value={stats.lowStockCount.toString()} 
            icon={<AlertTriangle className={stats.lowStockCount > 0 ? "text-amber-500" : "text-zinc-500"} />} 
            description="Perlu belanja segera"
          />
          <StatCard 
            title="Total Bahan" 
            value={stats.ingredientsCount.toString()} 
            icon={<Package className="text-purple-500" />} 
          />
        </div>

        {/* Action Sections */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section className="glass rounded-3xl p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Menu Terlaris</h2>
              <button className="text-sm font-medium text-primary hover:underline">Lihat Semua</button>
            </div>
            <div className="space-y-4">
              <p className="text-zinc-500 text-sm">Belum ada data penjualan hari ini.</p>
            </div>
          </section>

          <section className="glass rounded-3xl p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Log Aktivitas</h2>
            </div>
            <div className="space-y-6">
              <ActivityItem 
                title="Sistem Siap" 
                time="Sekarang" 
                description="Database dan sistem HPP Salero telah dikonfigurasi." 
              />
              <ActivityItem 
                title="Input Bahan Baku" 
                time="Tadi" 
                description="Menambahkan 2 bahan baku awal (Beef, Beras)." 
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, trend, description }: any) {
  return (
    <div className="glass group relative overflow-hidden rounded-3xl p-6 transition-all hover:bg-zinc-900/50">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 transition-colors group-hover:border-primary/50">
          {icon}
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-xs font-bold text-primary">
            <TrendingUp size={14} />
            {trend}
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-zinc-500">{title}</p>
      <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
      {description && <p className="mt-2 text-xs text-zinc-600">{description}</p>}
    </div>
  );
}

function ActivityItem({ title, time, description }: any) {
  return (
    <div className="relative pl-8 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-primary">
      <div className="absolute left-[3px] top-4 h-full w-[2px] bg-zinc-800 last:hidden"></div>
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-bold text-zinc-200">{title}</h4>
        <span className="text-xs text-zinc-500">{time}</span>
      </div>
      <p className="text-sm text-zinc-500">{description}</p>
    </div>
  );
}
