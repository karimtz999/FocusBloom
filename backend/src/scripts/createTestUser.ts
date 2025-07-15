// Test script to create a regular user for testing
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@user.com' }
    });

    if (existingUser) {
      console.log('✅ Test user already exists:');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Name: ${existingUser.name}`);
      return;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'test@user.com',
        password: hashedPassword,
        name: 'Test User'
      }
    });

    console.log('✅ Test user created successfully:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Password: test123`);
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
