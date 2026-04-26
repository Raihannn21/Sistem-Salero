import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";
import { prisma } from "@/lib/prisma";
import SalesHistoryController from "@/components/SalesHistoryController";

export default async function SalesHistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userRole = (session.user as any).role;
  const userId = (session.user as any).id;

  // Mengambil data Transaksi (Nota), bukan per Sale (Item)
  const [transactions, menuItems] = await Promise.all([
    prisma.transaction.findMany({
      where: userRole === "OWNER" ? {} : { userId },
      include: { 
        sales: {
          include: { menuItem: true }
        },
        user: {
          select: { username: true, fullName: true }
        }
      },
      orderBy: { date: 'desc' },
    }),
    prisma.menuItem.findMany({ orderBy: { name: 'asc' } })
  ]);

  return (
    <div className="min-h-screen bg-[#fcfcfc] lg:pl-72">
      <Navigation />
      
      <main className="p-8 lg:p-12 max-w-[1600px] mx-auto animate-in">
        <SalesHistoryController initialTransactions={transactions} menuItems={menuItems} />
      </main>
    </div>
  );
}
