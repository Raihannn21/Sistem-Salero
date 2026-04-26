import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";
import { prisma } from "@/lib/prisma";
import MenuController from "@/components/MenuController";
import { calculateMenuHPP } from "@/lib/hpp";

export default async function MenuPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch all necessary data on the server
  const [menuItemsRaw, ingredients] = await Promise.all([
    prisma.menuItem.findMany({
      include: {
        recipes: {
          include: {
            ingredient: true,
          },
        },
      },
      orderBy: { name: 'asc' }
    }),
    prisma.ingredient.findMany({
      orderBy: { name: 'asc' }
    })
  ]);

  // Calculate HPP and Margin on server to keep logic centralized
  const menuItems = menuItemsRaw.map(item => {
    const hpp = calculateMenuHPP(item.recipes);
    
    const margin = item.basePrice - hpp;
    const marginPercent = item.basePrice > 0 ? (margin / item.basePrice) * 100 : 0;
    
    return { ...item, hpp, margin, marginPercent };
  });

  return (
    <div className="min-h-screen bg-[#fcfcfc] lg:pl-72">
      <Navigation />
      <main className="p-8 lg:p-12 max-w-[1600px] mx-auto animate-in">
        <MenuController menuItems={menuItems} ingredients={ingredients} />
      </main>
    </div>
  );
}
