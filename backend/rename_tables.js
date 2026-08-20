const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function renameTables() {
  try {
    console.log('Renaming tables in PostgreSQL...');
    await prisma.$executeRawUnsafe('ALTER TABLE "User" RENAME TO "customer_users";');
    await prisma.$executeRawUnsafe('ALTER TABLE "Mitra" RENAME TO "mitra_users";');
    await prisma.$executeRawUnsafe('ALTER TABLE "Order" RENAME TO "customer_orders";');
    await prisma.$executeRawUnsafe('ALTER TABLE "Service" RENAME TO "services";');
    await prisma.$executeRawUnsafe('ALTER TABLE "ChatMessage" RENAME TO "order_chats";');
    
    console.log('Tables renamed successfully!');
  } catch (error) {
    console.error('Error renaming tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

renameTables();
