import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany();
    console.log('Total users:', users.length);
    
    users.forEach((user: any, index: number) => {
      console.log(`User ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Created: ${user.createdAt}`);
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
