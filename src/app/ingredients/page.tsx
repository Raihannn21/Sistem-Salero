import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navigation from "@/components/Navigation";
import { prisma } from "@/lib/prisma";
import IngredientController from "@/components/IngredientController";

export default async function IngredientsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const ingredients = await prisma.ingredient.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="min-h-screen bg-[#fcfcfc] lg:pl-72">
      <Navigation />
      
      <main className="p-8 lg:p-12 max-w-[1600px] mx-auto animate-in">
        <IngredientController ingredients={ingredients} />
      </main>
    </div>
  );
}
