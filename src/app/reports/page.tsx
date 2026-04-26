import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";
import { prisma } from "@/lib/prisma";
import ReportController from "@/components/ReportController";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if ((session.user as any).role !== "OWNER") {
    redirect("/sales");
  }

  // Fetch all sales and expenses
  const [sales, expenses] = await Promise.all([
    prisma.sale.findMany({
      include: { menuItem: true },
      orderBy: { date: 'desc' }
    }),
    prisma.expense.findMany({
      orderBy: { date: 'desc' }
    })
  ]);

  // Combine into a unified transaction list
  const transactions: any[] = [
    ...sales.map(s => ({
      id: `sale-${s.id}`,
      date: s.date,
      description: `Penjualan: ${s.menuItem.name} (${s.quantity} porsi)`,
      amount: s.totalPrice,
      type: 'INCOME'
    })),
    ...expenses.map(e => ({
      id: `exp-${e.id}`,
      date: e.date,
      description: e.description,
      amount: e.amount,
      type: 'EXPENSE'
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const totalRevenue = sales.reduce((acc, s) => acc + s.totalPrice, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="min-h-screen bg-[#fcfcfc] lg:pl-72">
      <Navigation />
      <main className="p-8 lg:p-12 max-w-[1600px] mx-auto animate-in">
        <ReportController 
          transactions={transactions} 
          totalRevenue={totalRevenue} 
          totalExpenses={totalExpenses} 
        />
      </main>
    </div>
  );
}
