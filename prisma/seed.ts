import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Bersihkan data lama untuk testing bersih
  await prisma.sale.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.user.deleteMany();

  console.log("Memulai seeding Admin Utama...");

  // Buat Akun OWNER (Admin Utama)
  const hashedAdminPassword = await bcrypt.hash("November2826", 10);
  await prisma.user.create({
    data: {
      username: "salerobana",
      password: hashedAdminPassword,
      role: "OWNER",
      fullName: "Owner Salero Bana",
    },
  });

  console.log("Seeding selesai!");
  console.log("HANYA ADMIN: salerobana | Password: November2826");
}

main()
  .catch((e) => {
    console.error("Error Seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
