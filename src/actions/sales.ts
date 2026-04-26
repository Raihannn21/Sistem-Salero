"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function recordSale(formData: FormData) {
  try {
    const menuItemId = formData.get("menuItemId") as string;
    const quantity = parseInt(formData.get("quantity") as string);

    if (!menuItemId || isNaN(quantity)) {
      return { success: false, error: "Data penjualan tidak valid." };
    }

    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
    });

    if (!menuItem) throw new Error("Menu item not found");

    const totalPrice = menuItem.basePrice * quantity;

    await prisma.sale.create({
      data: {
        menuItemId,
        quantity,
        totalPrice
      }
    });

    revalidatePath("/sales");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error recording sale:", error);
    return { success: false, error: "Gagal mencatat penjualan." };
  }
}
