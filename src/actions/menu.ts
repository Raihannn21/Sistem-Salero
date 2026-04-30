"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addMenuItem(data: {
  name: string;
  basePrice: number;
  image?: string;
}) {
  try {
    await prisma.menuItem.create({
      data: {
        name: data.name,
        basePrice: data.basePrice,
        image: data.image,
      }
    });

    revalidatePath("/menu");
    revalidatePath("/");
    revalidatePath("/sales");
    return { success: true };
  } catch (error: any) {
    console.error("DEBUG - Error adding menu item:", error.message || error);
    return { success: false, error: `Gagal menambah menu: ${error.message || "Kesalahan Sistem"}` };
  }
}

export async function updateMenuItem(id: string, data: {
  name: string;
  basePrice: number;
  image?: string;
}) {
  try {
    await prisma.menuItem.update({
      where: { id },
      data: {
        name: data.name,
        basePrice: data.basePrice,
        image: data.image,
      }
    });

    revalidatePath("/menu");
    revalidatePath("/");
    revalidatePath("/sales");
    return { success: true };
  } catch (error: any) {
    console.error("DEBUG - Error updating menu item:", error.message || error);
    return { success: false, error: `Gagal memperbarui menu: ${error.message || "Kesalahan Sistem"}` };
  }
}

export async function deleteMenuItem(id: string) {
  try {
    await prisma.menuItem.delete({
      where: { id }
    });

    revalidatePath("/menu");
    revalidatePath("/");
    revalidatePath("/sales");
    return { success: true };
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return { success: false, error: "Gagal menghapus menu." };
  }
}
