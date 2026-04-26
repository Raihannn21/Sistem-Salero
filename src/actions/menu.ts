"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addMenuItem(data: {
  name: string;
  description: string;
  basePrice: number;
  recipes: { ingredientId: string; quantity: number }[];
}) {
  try {
    await prisma.menuItem.create({
      data: {
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        recipes: {
          create: data.recipes.map(r => ({
            ingredientId: r.ingredientId,
            quantity: r.quantity
          }))
        }
      }
    });

    revalidatePath("/menu");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error adding menu item:", error);
    return { success: false, error: "Gagal menambah menu." };
  }
}

export async function updateMenuItem(id: string, data: {
  name: string;
  description: string;
  basePrice: number;
  recipes: { ingredientId: string; quantity: number }[];
}) {
  try {
    await prisma.$transaction([
      prisma.recipeItem.deleteMany({
        where: { menuItemId: id }
      }),
      prisma.menuItem.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          basePrice: data.basePrice,
          recipes: {
            create: data.recipes.map(r => ({
              ingredientId: r.ingredientId,
              quantity: r.quantity
            }))
          }
        }
      })
    ]);

    revalidatePath("/menu");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating menu item:", error);
    return { success: false, error: "Gagal memperbarui menu." };
  }
}

export async function deleteMenuItem(id: string) {
  try {
    await prisma.menuItem.delete({
      where: { id }
    });

    revalidatePath("/menu");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return { success: false, error: "Gagal menghapus menu." };
  }
}
