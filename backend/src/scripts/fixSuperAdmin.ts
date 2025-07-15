import { PrismaClient, AdminRole } from '../generated/prisma';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function testAndFixAdmin() {
  try {
    console.log('🔌 Connecting to PostgreSQL...');
    
    // Find the super admin
    const superAdmin = await prisma.admin.findFirst({
      where: { role: AdminRole.SUPER_ADMIN }
    });

    if (!superAdmin) {
      console.log('❌ No super admin found!');
      return;
    }

    console.log('✅ Super admin found:');
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Name: ${superAdmin.name}`);
    console.log(`   ID: ${superAdmin.id}`);

    // Test the current password
    const testPassword = 'admin123456';
    const isValidPassword = await bcrypt.compare(testPassword, superAdmin.password);
    
    console.log(`🔒 Password verification: ${isValidPassword ? '✅ Valid' : '❌ Invalid'}`);

    if (!isValidPassword) {
      console.log('🔧 Fixing password...');
      
      // Hash the correct password
      const hashedPassword = await bcrypt.hash(testPassword, 12);
      
      // Update the admin with the correct password
      await prisma.admin.update({
        where: { id: superAdmin.id },
        data: { password: hashedPassword }
      });
      
      console.log('✅ Password updated successfully!');
      
      // Verify the fix
      const updatedAdmin = await prisma.admin.findUnique({
        where: { id: superAdmin.id }
      });
      
      if (updatedAdmin) {
        const isNowValid = await bcrypt.compare(testPassword, updatedAdmin.password);
        console.log(`🔒 Password verification after fix: ${isNowValid ? '✅ Valid' : '❌ Still Invalid'}`);
      }
    }

    console.log('');
    console.log('👑 UPDATED SUPER ADMIN CREDENTIALS');
    console.log('='.repeat(40));
    console.log('📧 Email: admin@pomodoro.com');
    console.log('🔒 Password: admin123456');
    console.log('👤 Name: Super Admin');
    console.log(`🆔 ID: ${superAdmin.id}`);
    console.log('='.repeat(40));

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAndFixAdmin();
