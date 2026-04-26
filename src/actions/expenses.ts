"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addExpense(data: {
  description: string;
  amount: number;
  category: string;
  date?: Date;
}) {
  try {
    await prisma.expense.create({
      data: {
        description: data.description,
        amount: data.amount,
        category: data.category,
        date: data.date || new Date(),
      }
    });

    revalidatePath("/expenses");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error adding expense:", error);
    return { success: false, error: "Gagal mencatat pengeluaran." };
  }
}

export async function deleteExpense(id: string) {
  try {
    await prisma.expense.delete({
      where: { id }
    });

    revalidatePath("/expenses");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting expense:", error);
    return { success: false, error: "Gagal menghapus pengeluaran." };
  }
}
