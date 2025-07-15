import { PrismaClient, AdminRole } from '../generated/prisma';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import * as readline from 'readline';

dotenv.config();

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

function hideInput(query: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(query);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    let input = '';
    const onData = (key: string) => {
      if (key === '\r' || key === '\n') {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener('data', onData);
        console.log();
        resolve(input);
      } else if (key === '\u0003') { // Ctrl+C
        process.exit();
      } else if (key === '\u007f') { // Backspace
        if (input.length > 0) {
          input = input.slice(0, -1);
          process.stdout.write('\b \b');
        }
      } else {
        input += key;
        process.stdout.write('*');
      }
    };
    
    process.stdin.on('data', onData);
  });
}

async function showMenu() {
  console.clear();
  console.log('============================================================');
  console.log('🔐 POMODORO ADMIN MANAGER (PostgreSQL)');
  console.log('============================================================');
  console.log('1. 👤 Show Super Admin Info');
  console.log('2. 📋 List All Admins');
  console.log('3. ➕ Create New Admin');
  console.log('4. 👥 List All Users');
  console.log('5. 🔐 Verify Admin Credentials');
  console.log('6. 📊 Show Statistics');
  console.log('7. 🔧 Toggle Admin Status');
  console.log('8. 🗑️  Delete Admin');
  console.log('9. 🚪 Exit');
  console.log('============================================================');
}

async function showSuperAdmin() {
  try {
    const superAdmin = await prisma.admin.findFirst({
      where: { role: AdminRole.SUPER_ADMIN }
    });

    if (!superAdmin) {
      console.log('❌ No super admin found! Run npm run setup-admin first.');
      return;
    }

    console.log('👑 SUPER ADMIN INFO');
    console.log('='.repeat(30));
    console.log(`📧 Email: ${superAdmin.email}`);
    console.log(`👤 Name: ${superAdmin.name}`);
    console.log(`🆔 ID: ${superAdmin.id}`);
    console.log(`🟢 Active: ${superAdmin.isActive ? 'Yes' : 'No'}`);
    console.log(`🕒 Last Login: ${superAdmin.lastLogin ? superAdmin.lastLogin.toLocaleString() : 'Never'}`);
    console.log(`📅 Created: ${superAdmin.createdAt.toLocaleString()}`);
  } catch (error: any) {
    console.error('❌ Error fetching super admin:', error.message);
  }
}

async function listAllAdmins() {
  try {
    const admins = await prisma.admin.findMany({
      orderBy: { createdAt: 'desc' }
    });

    if (admins.length === 0) {
      console.log('📭 No admins found.');
      return;
    }

    console.log('📋 ALL ADMINS');
    console.log('='.repeat(60));
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} (${admin.email})`);
      console.log(`   👑 Role: ${admin.role}`);
      console.log(`   🟢 Active: ${admin.isActive ? 'Yes' : 'No'}`);
      console.log(`   🕒 Last Login: ${admin.lastLogin ? admin.lastLogin.toLocaleString() : 'Never'}`);
      console.log(`   🆔 ID: ${admin.id}`);
      console.log();
    });
  } catch (error: any) {
    console.error('❌ Error listing admins:', error.message);
  }
}

async function createNewAdmin() {
  try {
    const email = await question('📧 Enter admin email: ');
    const name = await question('👤 Enter admin name: ');
    const password = await hideInput('🔒 Enter admin password: ');
    const roleInput = await question('👑 Enter role (admin/super-admin) [admin]: ');
    
    const role = roleInput.toLowerCase() === 'super-admin' ? AdminRole.SUPER_ADMIN : AdminRole.ADMIN;

    if (!email || !name || !password) {
      console.log('❌ All fields are required!');
      return;
    }

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      console.log('❌ Admin with this email already exists!');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await prisma.admin.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role
      }
    });

    console.log('✅ Admin created successfully!');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`👤 Name: ${admin.name}`);
    console.log(`👑 Role: ${admin.role}`);
    console.log(`🆔 ID: ${admin.id}`);
  } catch (error: any) {
    console.error('❌ Error creating admin:', error.message);
  }
}

async function listAllUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });

    if (users.length === 0) {
      console.log('📭 No users found.');
      return;
    }

    console.log('👥 ALL USERS');
    console.log('='.repeat(60));
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   📅 Joined: ${user.createdAt.toLocaleString()}`);
      console.log(`   🆔 ID: ${user.id}`);
      console.log();
    });
  } catch (error: any) {
    console.error('❌ Error listing users:', error.message);
  }
}

async function verifyAdminCredentials() {
  try {
    const email = await question('📧 Enter admin email: ');
    const password = await hideInput('🔒 Enter admin password: ');

    const admin = await prisma.admin.findUnique({
      where: { email }
    });

    if (!admin) {
      console.log('❌ Admin not found!');
      return;
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (isMatch) {
      console.log('✅ Credentials are valid!');
      console.log(`👤 Name: ${admin.name}`);
      console.log(`👑 Role: ${admin.role}`);
      console.log(`🟢 Active: ${admin.isActive ? 'Yes' : 'No'}`);
    } else {
      console.log('❌ Invalid password!');
    }
  } catch (error: any) {
    console.error('❌ Error verifying credentials:', error.message);
  }
}

async function showStatistics() {
  try {
    const [adminCount, activeAdminCount, superAdminCount, userCount, sessionCount] = await Promise.all([
      prisma.admin.count(),
      prisma.admin.count({ where: { isActive: true } }),
      prisma.admin.count({ where: { role: AdminRole.SUPER_ADMIN } }),
      prisma.user.count(),
      prisma.pomodoroSession.count()
    ]);

    console.log('📊 SYSTEM STATISTICS');
    console.log('='.repeat(40));
    console.log(`👑 Total Admins: ${adminCount}`);
    console.log(`🟢 Active Admins: ${activeAdminCount}`);
    console.log(`👑 Super Admins: ${superAdminCount}`);
    console.log(`👥 Total Users: ${userCount}`);
    console.log(`⏱️  Total Sessions: ${sessionCount}`);
  } catch (error: any) {
    console.error('❌ Error fetching statistics:', error.message);
  }
}

async function toggleAdminStatus() {
  try {
    const email = await question('📧 Enter admin email to toggle: ');
    
    const admin = await prisma.admin.findUnique({
      where: { email }
    });

    if (!admin) {
      console.log('❌ Admin not found!');
      return;
    }

    const updatedAdmin = await prisma.admin.update({
      where: { id: admin.id },
      data: { isActive: !admin.isActive }
    });

    console.log(`✅ Admin ${updatedAdmin.isActive ? 'activated' : 'deactivated'} successfully!`);
    console.log(`👤 Name: ${updatedAdmin.name}`);
    console.log(`📧 Email: ${updatedAdmin.email}`);
    console.log(`🟢 Status: ${updatedAdmin.isActive ? 'Active' : 'Inactive'}`);
  } catch (error: any) {
    console.error('❌ Error toggling admin status:', error.message);
  }
}

async function deleteAdmin() {
  try {
    const email = await question('📧 Enter admin email to delete: ');
    
    const admin = await prisma.admin.findUnique({
      where: { email }
    });

    if (!admin) {
      console.log('❌ Admin not found!');
      return;
    }

    if (admin.role === AdminRole.SUPER_ADMIN) {
      const superAdminCount = await prisma.admin.count({
        where: { role: AdminRole.SUPER_ADMIN }
      });
      
      if (superAdminCount <= 1) {
        console.log('❌ Cannot delete the last super admin!');
        return;
      }
    }

    const confirm = await question(`⚠️  Are you sure you want to delete ${admin.name} (${admin.email})? (yes/no): `);
    
    if (confirm.toLowerCase() === 'yes') {
      await prisma.admin.delete({
        where: { id: admin.id }
      });
      console.log('✅ Admin deleted successfully!');
    } else {
      console.log('❌ Deletion cancelled.');
    }
  } catch (error: any) {
    console.error('❌ Error deleting admin:', error.message);
  }
}

async function main() {
  console.log('🔌 Connecting to PostgreSQL...');
  
  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL');
  } catch (error: any) {
    console.log('❌ PostgreSQL connection failed:', error.message);
    console.log('💡 Make sure PostgreSQL is running and DATABASE_URL is set');
    process.exit(1);
  }

  while (true) {
    try {
      await showMenu();
      const choice = await question('Enter your choice (1-9): ');

      switch (choice) {
        case '1':
          await showSuperAdmin();
          break;
        case '2':
          await listAllAdmins();
          break;
        case '3':
          await createNewAdmin();
          break;
        case '4':
          await listAllUsers();
          break;
        case '5':
          await verifyAdminCredentials();
          break;
        case '6':
          await showStatistics();
          break;
        case '7':
          await toggleAdminStatus();
          break;
        case '8':
          await deleteAdmin();
          break;
        case '9':
          console.log('ℹ️  Goodbye! 👋');
          rl.close();
          await prisma.$disconnect();
          process.exit(0);
        default:
          console.log('❌ Invalid choice. Please try again.');
      }

      await question('\nPress Enter to continue...');
    } catch (error: any) {
      console.error('❌ Error:', error.message);
      await question('\nPress Enter to continue...');
    }
  }
}

main().catch(console.error);
