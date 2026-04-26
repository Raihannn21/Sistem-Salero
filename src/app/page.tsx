import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";
import { prisma } from "@/lib/prisma";
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign,
  Package,
  UtensilsCrossed
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { calculateMenuHPP } from "@/lib/hpp";

async function getStats() {
  const [salesData, menuItemsCount, ingredientsCount] = await Promise.all([
    prisma.sale.findMany({
      include: {
        menuItem: {
          include: {
            recipes: {
              include: { ingredient: true }
            }
          }
        }
      }
    }),
    prisma.menuItem.count(),
    prisma.ingredient.count(),
  ]);

  const totalRevenue = salesData.reduce((acc, sale) => acc + sale.totalPrice, 0);
  
  // Calculate Total HPP based on sales history
  const totalHPP = salesData.reduce((acc, sale) => {
    const hppPerUnit = calculateMenuHPP(sale.menuItem.recipes);
    return acc + (hppPerUnit * sale.quantity);
  }, 0);

  const totalProfit = totalRevenue - totalHPP;

  return {
    totalRevenue,
    totalProfit,
    salesCount: salesData.length,
    menuItemsCount,
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
        <PageHeader 
          category="Ringkasan Dashboard"
          title={`Halo, ${session.user?.name}! 👋`}
          description="Pantau performa penjualan dan keuntungan restoran Anda hari ini."
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <StatCard 
            title="Total Omzet" 
            value={formatCurrency(stats.totalRevenue)} 
            icon={<DollarSign size={24} />}
            trend={{ value: 12, isUp: true }}
          />
          <StatCard 
            title="Total Keuntungan" 
            value={formatCurrency(stats.totalProfit)} 
            icon={<TrendingUp size={24} />}
            trend={{ value: 8, isUp: true }}
            variant="primary"
          />
          <StatCard 
            title="Menu Terjual" 
            value={stats.salesCount.toString()} 
            icon={<ShoppingCart size={24} />}
          />
          <StatCard 
            title="Total Menu" 
            value={stats.menuItemsCount.toString()} 
            icon={<UtensilsCrossed size={24} />}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          {/* Quick Actions / Info */}
          <Card className="xl:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-extrabold text-zinc-900 tracking-tight">Performa Menu</h3>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Live Data</span>
            </div>
            
            <div className="space-y-6">
              <div className="p-8 rounded-[2.5rem] bg-zinc-50 border border-zinc-100 flex items-center justify-between group hover:border-primary/20 transition-all">
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Package size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-extrabold text-zinc-900 tracking-tight">Data Bahan Baku</h4>
                    <p className="text-sm font-bold text-zinc-400">Terdapat {stats.ingredientsCount} bahan baku terdaftar.</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-zinc-900 tracking-tighter">{stats.ingredientsCount}</p>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Items</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Activity Feed */}
          <Card className="xl:col-span-1">
            <h3 className="text-xl font-extrabold text-zinc-900 mb-10 tracking-tight">Aktivitas Terbaru</h3>
            <div className="space-y-10">
              <ActivityItem 
                title="Sistem Siap" 
                time="Sekarang" 
                description="Database dan sistem HPP Salero telah dikonfigurasi." 
              />
              <ActivityItem 
                title="Update Komponen" 
                time="Tadi" 
                description="Sistem stok telah dinonaktifkan untuk fokus pada keuntungan." 
              />
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

interface ActivityItemProps {
  title: string;
  time: string;
  description: string;
}

function ActivityItem({ title, time, description }: ActivityItemProps) {
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
