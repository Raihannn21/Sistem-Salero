"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addIngredient(data: {
  name: string;
  unit: string;
  pricePerUnit: number;
  recipeUnit?: string | null;
  recipeYield?: number;
}) {
  try {
    await prisma.ingredient.create({
      data: {
        name: data.name,
        unit: data.unit,
        pricePerUnit: data.pricePerUnit,
        recipeUnit: data.recipeUnit,
        recipeYield: data.recipeYield || 1,
      }
    });

    revalidatePath("/ingredients");
    revalidatePath("/menu");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error adding ingredient:", error);
    return { success: false, error: "Gagal menambah bahan baku." };
  }
}

export async function updateIngredient(id: string, data: {
  name: string;
  unit: string;
  pricePerUnit: number;
  recipeUnit?: string | null;
  recipeYield?: number;
}) {
  try {
    if (!id) {
      console.error("Update Ingredient Error: Missing ID");
      return { success: false, error: "ID bahan baku tidak ditemukan." };
    }

    console.log("Updating Ingredient ID:", id, "with data:", data);

    const updated = await prisma.ingredient.update({
      where: { id: id },
      data: {
        name: data.name,
        unit: data.unit,
        pricePerUnit: data.pricePerUnit,
        recipeUnit: data.recipeUnit,
        recipeYield: data.recipeYield || 1,
      }
    });

    console.log("Update Success:", updated.id);

    revalidatePath("/ingredients");
    revalidatePath("/menu");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating ingredient detail:", error);
    return { success: false, error: error.message || "Gagal memperbarui bahan baku." };
  }
}

export async function deleteIngredient(id: string) {
  try {
    await prisma.ingredient.delete({
      where: { id }
    });

    revalidatePath("/ingredients");
    revalidatePath("/menu");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting ingredient:", error);
    return { success: false, error: "Gagal menghapus bahan baku." };
  }
}
