const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const user = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  });

  console.log({ user });

  // Add some sample ingredients
  const beef = await prisma.ingredient.create({
    data: {
      name: 'Daging Sapi',
      unit: 'kg',
      pricePerUnit: 120000,
      stock: 5,
      minStock: 2,
    },
  });

  const rice = await prisma.ingredient.create({
    data: {
      name: 'Beras',
      unit: 'kg',
      pricePerUnit: 15000,
      stock: 25,
      minStock: 10,
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
