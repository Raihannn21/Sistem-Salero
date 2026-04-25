import { prisma } from "@/lib/prisma";

export async function calculateHPP(menuItemId: string) {
  const recipeItems = await prisma.recipeItem.findMany({
    where: { menuItemId },
    include: { ingredient: true }
  });

  const totalBahan = recipeItems.reduce((acc, item) => {
    return acc + (item.ingredient.pricePerUnit * item.quantity);
  }, 0);

  // We can add fixed overhead logic here later
  return totalBahan;
}
