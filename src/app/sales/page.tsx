import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";
import { prisma } from "@/lib/prisma";
import SalesController from "@/components/SalesController";

export default async function SalesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const [menuItems, recentSales] = await Promise.all([
    prisma.menuItem.findMany({ orderBy: { name: 'asc' } }),
    prisma.sale.findMany({
      include: { menuItem: true },
      orderBy: { date: 'desc' },
      take: 10,
    }),
  ]);

  return (
    <div className="min-h-screen bg-[#fcfcfc] lg:pl-72">
      <Navigation />
      
      <main className="p-8 lg:p-12 max-w-[1600px] mx-auto animate-in">
        <SalesController menuItems={menuItems} recentSales={recentSales} />
      </main>
    </div>
  );
}
