"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "OWNER") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getNotes() {
  try {
    const session = await checkAdmin();
    const userId = (session.user as any).id;
    
    return await prisma.note.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" }
    });
  } catch (error) {
    return [];
  }
}

export async function createNote(title: string, content: string) {
  try {
    const session = await checkAdmin();
    const userId = (session.user as any).id;
    
    await prisma.note.create({
      data: {
        title,
        content,
        userId
      }
    });
    revalidatePath("/notes");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal menyimpan catatan" };
  }
}

export async function updateNote(id: string, title: string, content: string) {
  try {
    await checkAdmin();
    
    await prisma.note.update({
      where: { id },
      data: { title, content }
    });
    revalidatePath("/notes");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal memperbarui catatan" };
  }
}

export async function deleteNote(id: string) {
  try {
    await checkAdmin();
    
    await prisma.note.delete({
      where: { id }
    });
    revalidatePath("/notes");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal menghapus catatan" };
  }
}
