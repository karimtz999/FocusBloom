import { PrismaClient, AdminRole } from '../generated/prisma';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    console.log('🔌 Connecting to PostgreSQL...');

    // Check if super admin already exists
    const existingSuperAdmin = await prisma.admin.findFirst({
      where: { role: AdminRole.SUPER_ADMIN }
    });

    if (existingSuperAdmin) {
      console.log('⚠️  Super admin already exists:');
      console.log(`   Name: ${existingSuperAdmin.name}`);
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log('   Use the admin manager to create additional admins.');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123456', 12);

    // Create default super admin
    const superAdmin = await prisma.admin.create({
      data: {
        name: 'Super Admin',
        email: 'admin@pomodoro.com',
        password: hashedPassword,
        role: AdminRole.SUPER_ADMIN
      }
    });

    console.log('🎉 Super Admin created successfully!');
    console.log('='.repeat(50));
    console.log('👑 SUPER ADMIN CREDENTIALS');
    console.log('='.repeat(50));
    console.log('📧 Email: admin@pomodoro.com');
    console.log('🔒 Password: admin123456');
    console.log('👤 Name: Super Admin');
    console.log('🆔 ID:', superAdmin.id);
    console.log('='.repeat(50));
    console.log('⚠️  IMPORTANT: Change the password immediately after first login!');
    console.log('💡 Use: npm run admin - to manage admin users');
    
  } catch (error: any) {
    console.error('❌ Error creating super admin:', error);
    if (error.code === 'P1001') {
      console.log('💡 Make sure PostgreSQL is running and DATABASE_URL is correct');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createSuperAdmin();
