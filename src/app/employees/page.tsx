import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";
import { prisma } from "@/lib/prisma";
import EmployeeController from "@/components/EmployeeController";

export default async function EmployeesPage() {
  const session = await getServerSession(authOptions);

  // Security: Only Owner can access this page
  if (!session) {
    redirect("/login");
  }

  if ((session.user as any).role !== "OWNER") {
    redirect("/sales"); // Employees redirected to Sales
  }

  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-[#fcfcfc] lg:pl-72">
      <Navigation />
      <main className="p-8 lg:p-12 max-w-[1600px] mx-auto animate-in">
        <EmployeeController employees={employees} />
      </main>
    </div>
  );
}
