"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function completeTransaction(items: { menuItemId: string, quantity: number }[]) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { success: false, error: "Sesi habis, silakan login kembali." };

    const userId = (session.user as any).id;
    
    // Calculate total
    let totalAmount = 0;
    const salesData = [];

    for (const item of items) {
      const menu = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } });
      if (!menu) continue;
      
      const price = menu.basePrice * item.quantity;
      totalAmount += price;
      
      salesData.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        totalPrice: price,
        userId: userId
      });
    }

    if (salesData.length === 0) return { success: false, error: "Keranjang kosong." };

    // Create Transaction and Sales in a single transaction
    await prisma.transaction.create({
      data: {
        totalAmount,
        userId,
        sales: {
          create: salesData
        }
      }
    });

    revalidatePath("/sales");
    revalidatePath("/sales/history");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Error completing transaction:", error);
    return { success: false, error: "Gagal memproses pesanan." };
  }
}

// Keep delete/update for single sales (Owner only)
export async function deleteSale(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "OWNER") {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.sale.delete({ where: { id } });
    revalidatePath("/sales/history");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal menghapus." };
  }
}
