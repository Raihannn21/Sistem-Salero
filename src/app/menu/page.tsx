import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";
import { prisma } from "@/lib/prisma";
import MenuController from "@/components/MenuController";

export default async function MenuPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if ((session.user as any).role !== "OWNER") {
    redirect("/sales");
  }

  // Fetch menu items and calculate total portions sold across all time
  const rawMenuItems = await prisma.menuItem.findMany({
    include: {
      sales: {
        select: { quantity: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  const menuItems = rawMenuItems.map(item => ({
    ...item,
    totalSold: item.sales.reduce((sum, s) => sum + s.quantity, 0)
  }));

  return (
    <div className="min-h-screen bg-[#fcfcfc] lg:pl-72">
      <Navigation />
      <main className="p-8 lg:p-12 max-w-[1600px] mx-auto animate-in">
        <MenuController menuItems={menuItems} />
      </main>
    </div>
  );
}
