import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

  // Fetch raw sales and expenses to allow client-side filtering
  const [sales, expenses] = await Promise.all([
    prisma.sale.findMany({
      include: { menuItem: true },
      orderBy: { date: 'desc' }
    }),
    prisma.expense.findMany({
      orderBy: { date: 'desc' }
    })
  ]);

  return (
    <div className="min-h-screen bg-[#fcfcfc] lg:pl-72">
      <Navigation />
      <main className="p-8 lg:p-12 max-w-[1600px] mx-auto animate-in">
        <ReportController 
          sales={sales} 
          expenses={expenses} 
        />
      </main>
    </div>
  );
}
