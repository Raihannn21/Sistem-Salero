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
  Package,
  UtensilsCrossed
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

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
    <div className="min-h-screen bg-[#fcfcfc] lg:pl-72">
      <Navigation />
      
      <main className="p-8 lg:p-12 max-w-[1600px] mx-auto animate-in">
        <header className="mb-12 flex flex-col gap-3">
          <div className="flex items-center gap-3 text-primary/60 font-black text-[10px] uppercase tracking-[0.3em]">
            <div className="h-[2px] w-8 bg-primary/40"></div>
            Ringkasan Dashboard
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-zinc-900 tracking-tight leading-tight">
            Halo, {session.user?.name}! 👋
          </h1>
          <p className="text-zinc-500 font-semibold text-base">
            Berikut adalah performa Salero hari ini.
          </p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
          <StatCard 
            title="Total Pendapatan" 
            value={formatCurrency(stats.totalRevenue)} 
            icon={<DollarSign size={24} />} 
            trend="+12%"
            color="primary"
          />
          <StatCard 
            title="Total Penjualan" 
            value={stats.salesCount.toString()} 
            icon={<ShoppingCart size={24} />} 
            color="primary"
          />
          <StatCard 
            title="Stok Rendah" 
            value={stats.lowStockCount.toString()} 
            icon={<AlertTriangle size={24} />} 
            description="Perlu belanja segera"
            color={stats.lowStockCount > 0 ? "maroon" : "zinc"}
          />
          <StatCard 
            title="Total Bahan" 
            value={stats.ingredientsCount.toString()} 
            icon={<Package size={24} />} 
            color="zinc"
          />
        </div>

        {/* Action Sections */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <section className="bg-white rounded-[2.5rem] p-10 border border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight">Menu Terlaris</h2>
              <button className="text-sm font-black text-primary hover:tracking-widest transition-all">LIHAT SEMUA</button>
            </div>
            <div className="space-y-4">
              <div className="p-8 rounded-3xl bg-zinc-50 border border-dashed border-zinc-200 flex flex-col items-center text-center">
                <UtensilsCrossed className="text-zinc-300 mb-4" size={32} />
                <p className="text-zinc-400 text-sm font-bold">Belum ada data penjualan hari ini.</p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[2.5rem] p-10 border border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight">Log Aktivitas</h2>
            </div>
            <div className="space-y-10">
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

function StatCard({ title, value, icon, trend, description, color }: any) {
  return (
    <div className="group relative overflow-hidden rounded-[2.5rem] bg-white p-8 border border-zinc-50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_20px_60px_-10px_rgba(128,0,0,0.08)] hover:-translate-y-1">
      <div className="mb-6 flex items-center justify-between">
        <div className={cn(
          "flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-500",
          color === "primary" || color === "maroon" ? "bg-primary text-white shadow-xl shadow-primary/20 rotate-3 group-hover:rotate-0" : "bg-zinc-50 text-zinc-400 border border-zinc-100"
        )}>
          {icon}
        </div>
        {trend && (
          <span className="flex items-center gap-1.5 text-xs font-black text-primary bg-primary/5 px-3 py-1.5 rounded-full">
            <TrendingUp size={14} strokeWidth={3} />
            {trend}
          </span>
        )}
      </div>
      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">{title}</p>
      <h3 className="text-2xl font-extrabold text-zinc-900 mt-2 tracking-tight leading-none group-hover:text-primary transition-colors">{value}</h3>
      {description && <div className="mt-4 text-xs font-bold text-zinc-400 flex items-center gap-2">
        <div className="h-1 w-1 rounded-full bg-primary/40"></div>
        {description}
      </div>}
    </div>
  );
}

function ActivityItem({ title, time, description }: any) {
  return (
    <div className="relative pl-10 group/item">
      <div className="absolute left-0 top-0 h-10 w-10 rounded-full bg-white border border-zinc-100 shadow-sm flex items-center justify-center z-10 group-hover/item:border-primary/30 transition-colors">
        <div className="h-2 w-2 rounded-full bg-primary group-hover/item:scale-150 transition-transform"></div>
      </div>
      <div className="absolute left-[19px] top-10 h-full w-[2px] bg-zinc-50 last:hidden"></div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-zinc-900 tracking-tight">{title}</h4>
        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 px-2 py-1 rounded-md">{time}</span>
      </div>
      <p className="text-sm font-bold text-zinc-500 leading-relaxed">{description}</p>
    </div>
  );
}
