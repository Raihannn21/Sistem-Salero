import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";
import { prisma } from "@/lib/prisma";
import ExpenseController from "@/components/ExpenseController";
import { startOfDay, endOfDay } from "date-fns";

export default async function ExpensesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if ((session.user as any).role !== "OWNER") {
    redirect("/sales");
  }

  // Fetch expenses for today
  const expenses = await prisma.expense.findMany({
    orderBy: { date: 'desc' }
  });

  return (
    <div className="min-h-screen bg-[#fcfcfc] lg:pl-72">
      <Navigation />
      <main className="p-8 lg:p-12 max-w-[1600px] mx-auto animate-in">
        <ExpenseController expenses={expenses} />
      </main>
    </div>
  );
}
