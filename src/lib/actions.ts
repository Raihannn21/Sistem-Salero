"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function recordSale(formData: FormData) {
  const menuItemId = formData.get("menuItemId") as string;
  const quantity = parseInt(formData.get("quantity") as string);

  const menuItem = await prisma.menuItem.findUnique({
    where: { id: menuItemId },
    include: { recipes: true }
  });

  if (!menuItem) throw new Error("Menu item not found");

  const totalPrice = menuItem.basePrice * quantity;

  // 1. Create Sale record
  await prisma.sale.create({
    data: {
      menuItemId,
      quantity,
      totalPrice
    }
  });

  // 2. Reduce ingredients stock based on recipe
  for (const recipe of menuItem.recipes) {
    await prisma.ingredient.update({
      where: { id: recipe.ingredientId },
      data: {
        stock: {
          decrement: recipe.quantity * quantity
        }
      }
    });
  }

  revalidatePath("/sales");
  revalidatePath("/");
  revalidatePath("/ingredients");
}
