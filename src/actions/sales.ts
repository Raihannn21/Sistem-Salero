"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Menyelesaikan satu Nota/Transaksi (Bulk)
 */
export async function completeTransaction(items: { menuItemId: string, quantity: number }[]) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { success: false, error: "Sesi habis, silakan login kembali." };

    const userId = (session.user as any).id;
    
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

/**
 * Mencatat penjualan tunggal (Legacy support)
 */
export async function recordSale(data: { menuItemId: string, quantity: number }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return { success: false, error: "Unauthorized" };

    const menu = await prisma.menuItem.findUnique({ where: { id: data.menuItemId } });
    if (!menu) return { success: false, error: "Menu tidak ditemukan" };

    const totalPrice = menu.basePrice * data.quantity;

    await prisma.sale.create({
      data: {
        ...data,
        totalPrice,
        userId: (session.user as any).id
      }
    });

    revalidatePath("/sales/history");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal mencatat penjualan" };
  }
}

/**
 * Mengupdate item penjualan dan menghitung ulang total nota
 */
export async function updateSale(id: string, data: { menuItemId: string, quantity: number }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "OWNER") {
      return { success: false, error: "Hanya Owner yang bisa mengedit." };
    }

    const menu = await prisma.menuItem.findUnique({ where: { id: data.menuItemId } });
    if (!menu) return { success: false, error: "Menu tidak ditemukan" };

    const totalPrice = menu.basePrice * data.quantity;

    // Update Sale item
    const updatedSale = await prisma.sale.update({
      where: { id },
      data: {
        menuItemId: data.menuItemId,
        quantity: data.quantity,
        totalPrice
      }
    });

    // Jika item ini bagian dari Nota (Transaction), update total nota tersebut
    if (updatedSale.transactionId) {
      const allSalesInTransaction = await prisma.sale.findMany({
        where: { transactionId: updatedSale.transactionId }
      });

      const newTotalAmount = allSalesInTransaction.reduce((sum, s) => sum + s.totalPrice, 0);

      await prisma.transaction.update({
        where: { id: updatedSale.transactionId },
        data: { totalAmount: newTotalAmount }
      });
    }

    revalidatePath("/sales/history");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error updating sale:", error);
    return { success: false, error: "Gagal memperbarui data." };
  }
}

/**
 * Menghapus item penjualan
 */
export async function deleteSale(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "OWNER") {
      return { success: false, error: "Unauthorized" };
    }

    const sale = await prisma.sale.findUnique({ where: { id } });
    if (!sale) return { success: false, error: "Data tidak ditemukan" };

    const transactionId = sale.transactionId;

    await prisma.sale.delete({ where: { id } });

    // Update total nota setelah item dihapus
    if (transactionId) {
      const remainingSales = await prisma.sale.findMany({
        where: { transactionId }
      });

      if (remainingSales.length === 0) {
        await prisma.transaction.delete({ where: { id: transactionId } });
      } else {
        const newTotalAmount = remainingSales.reduce((sum, s) => sum + s.totalPrice, 0);
        await prisma.transaction.update({
          where: { id: transactionId },
          data: { totalAmount: newTotalAmount }
        });
      }
    }

    revalidatePath("/sales/history");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal menghapus." };
  }
}
