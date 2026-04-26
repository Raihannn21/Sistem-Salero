"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function addEmployee(data: {
  username: string;
  password?: string;
  fullName: string;
  nik: string;
  address: string;
  emergencyContact: string;
  socialMedia: string;
}) {
  try {
    const hashedPassword = await bcrypt.hash(data.password || "123456", 10);
    
    await prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        role: "EMPLOYEE",
        fullName: data.fullName,
        nik: data.nik,
        address: data.address,
        emergencyContact: data.emergencyContact,
        socialMedia: data.socialMedia,
      }
    });

    revalidatePath("/employees");
    return { success: true };
  } catch (error: any) {
    console.error("Error adding employee:", error);
    if (error.code === 'P2002') {
      return { success: false, error: "Username sudah digunakan." };
    }
    return { success: false, error: "Gagal menambah karyawan." };
  }
}

export async function updateEmployee(id: string, data: any) {
  try {
    const updateData: any = {
      username: data.username,
      fullName: data.fullName,
      nik: data.nik,
      address: data.address,
      emergencyContact: data.emergencyContact,
      socialMedia: data.socialMedia,
    };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    await prisma.user.update({
      where: { id },
      data: updateData
    });

    revalidatePath("/employees");
    return { success: true };
  } catch (error) {
    console.error("Error updating employee:", error);
    return { success: false, error: "Gagal memperbarui karyawan." };
  }
}

export async function deleteEmployee(id: string) {
  try {
    await prisma.user.delete({
      where: { id }
    });

    revalidatePath("/employees");
    return { success: true };
  } catch (error) {
    console.error("Error deleting employee:", error);
    return { success: false, error: "Gagal menghapus karyawan." };
  }
}
