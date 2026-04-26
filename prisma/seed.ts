import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Bersihkan data lama untuk testing bersih
  await prisma.sale.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.user.deleteMany();

  console.log("Memulai seeding sistem profesional...");

  // 1. Buat Akun OWNER (Admin Utama)
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      username: "admin",
      password: hashedPassword,
      role: "OWNER",
      fullName: "Administrator Salero",
    },
  });

  // 2. Buat Beberapa Menu Awal
  const rendang = await prisma.menuItem.create({
    data: {
      name: "Nasi Rendang Spesial",
      basePrice: 25000,
    },
  });

  const ayam = await prisma.menuItem.create({
    data: {
      name: "Nasi Ayam Bakar",
      basePrice: 20000,
    },
  });

  // 3. Tambahkan Pengeluaran Awal (Opsional)
  await prisma.expense.create({
    data: {
      description: "Belanja Pasar Mingguan",
      amount: 500000,
      category: "Belanja",
    },
  });

  console.log("Seeding selesai! Akun 'admin' sekarang adalah OWNER dengan password 'admin123'.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
