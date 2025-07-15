const readline = require('readline');

// Colors for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

// Helper functions
const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`${colors.cyan}${colors.bright}🔐 ${msg}${colors.reset}`),
  admin: (msg) => console.log(`${colors.magenta}👑 ${msg}${colors.reset}`)
};

// Readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Default admin data (for demo)
const defaultAdmins = [
  {
    id: '1',
    name: 'Super Admin',
    email: 'admin@pomodoro.com',
    password: 'admin123456', // In real app, this would be hashed
    role: 'super-admin',
    isActive: true,
    createdAt: new Date(),
    lastLogin: null
  },
  {
    id: '2', 
    name: 'Regular Admin',
    email: 'moderator@pomodoro.com',
    password: 'moderator123',
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
    lastLogin: new Date()
  }
];

const demoUsers = [
  {
    id: '1',
    username: 'john_doe',
    email: 'john@example.com',
    createdAt: new Date('2025-06-01')
  },
  {
    id: '2', 
    username: 'sarah_smith',
    email: 'sarah@example.com',
    createdAt: new Date('2025-06-15')
  },
  {
    id: '3',
    username: 'mike_wilson', 
    email: 'mike@example.com',
    createdAt: new Date('2025-06-20')
  }
];

// Utility function to ask questions
const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
};

// Show admins list
function showAdminsList() {
  log.title('ALL ADMIN USERS (DEMO DATA)');
  console.log('\n' + '='.repeat(80));
  
  defaultAdmins.forEach((admin, index) => {
    const statusIcon = admin.isActive ? '🟢' : '🔴';
    const roleIcon = admin.role === 'super-admin' ? '👑' : '🛡️';
    
    console.log(`${colors.cyan}${index + 1}. ${admin.name}${colors.reset}`);
    console.log(`   ${roleIcon} Role: ${admin.role}`);
    console.log(`   📧 Email: ${admin.email}`);
    console.log(`   ${statusIcon} Status: ${admin.isActive ? 'Active' : 'Inactive'}`);
    console.log(`   📅 Created: ${admin.createdAt.toLocaleDateString()}`);
    if (admin.lastLogin) {
      console.log(`   🕐 Last Login: ${admin.lastLogin.toLocaleDateString()}`);
    }
    console.log(`   🆔 ID: ${admin.id}`);
    console.log('   ' + '-'.repeat(60));
  });
  
  console.log('='.repeat(80) + '\n');
  log.info(`Total admins: ${defaultAdmins.length}`);
}

// Show users list
function showUsersList() {
  log.title('ALL REGULAR USERS (DEMO DATA)');
  console.log('\n' + '='.repeat(80));
  
  demoUsers.forEach((user, index) => {
    console.log(`${colors.green}${index + 1}. ${user.username}${colors.reset}`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   📅 Joined: ${user.createdAt.toLocaleDateString()}`);
    console.log(`   🆔 ID: ${user.id}`);
    console.log('   ' + '-'.repeat(60));
  });
  
  console.log('='.repeat(80) + '\n');
  log.info(`Total users: ${demoUsers.length}`);
}

// Verify admin credentials
async function verifyAdmin() {
  log.title('VERIFY ADMIN CREDENTIALS (DEMO)');
  
  try {
    const email = await question('📧 Enter admin email: ');
    const password = await question('🔒 Enter admin password: ');
    
    const admin = defaultAdmins.find(a => a.email.toLowerCase() === email.toLowerCase());
    
    if (!admin) {
      log.error('Admin not found!');
      return;
    }
    
    if (admin.password === password) {
      log.success('✅ Credentials are valid!');
      log.admin(`Name: ${admin.name}`);
      log.admin(`Role: ${admin.role}`);
      log.admin(`Status: ${admin.isActive ? 'Active' : 'Inactive'}`);
    } else {
      log.error('❌ Invalid credentials!');
    }
    
  } catch (error) {
    log.error(`Verification failed: ${error.message}`);
  }
}

// Show statistics
function showStats() {
  log.title('SYSTEM STATISTICS (DEMO DATA)');
  
  const adminCount = defaultAdmins.length;
  const activeAdminCount = defaultAdmins.filter(a => a.isActive).length;
  const superAdminCount = defaultAdmins.filter(a => a.role === 'super-admin').length;
  const userCount = demoUsers.length;
  
  console.log('\n' + '='.repeat(50));
  log.info(`👑 Total Admins: ${adminCount}`);
  log.info(`🟢 Active Admins: ${activeAdminCount}`);
  log.info(`👑 Super Admins: ${superAdminCount}`);
  log.info(`👥 Regular Users: ${userCount}`);
  console.log('='.repeat(50) + '\n');
}

// Demo credentials info
function showDemoCredentials() {
  log.title('DEMO ADMIN CREDENTIALS');
  console.log('\n' + '='.repeat(60));
  console.log('🔐 Test these credentials in option 4:');
  console.log('');
  defaultAdmins.forEach((admin, index) => {
    console.log(`${colors.cyan}${index + 1}. ${admin.name}${colors.reset}`);
    console.log(`   📧 Email: ${admin.email}`);
    console.log(`   🔒 Password: ${admin.password}`);
    console.log(`   👑 Role: ${admin.role}`);
    console.log('');
  });
  console.log('='.repeat(60) + '\n');
}

// Main menu
async function showMenu() {
  console.log('\n' + '='.repeat(60));
  log.title('POMODORO ADMIN DEMO (NO DATABASE REQUIRED)');
  console.log('='.repeat(60));
  console.log('1. 👤 Show Demo Admin Credentials');
  console.log('2. 📋 List All Admins (Demo Data)');
  console.log('3. 👥 List All Users (Demo Data)');
  console.log('4. 🔐 Verify Admin Credentials');
  console.log('5. 📊 Show Statistics');
  console.log('6. 🌐 MongoDB Setup Instructions');
  console.log('7. 🚪 Exit');
  console.log('='.repeat(60));
  
  const choice = await question('Enter your choice (1-7): ');
  
  switch (choice) {
    case '1':
      showDemoCredentials();
      break;
    case '2':
      showAdminsList();
      break;
    case '3':
      showUsersList();
      break;
    case '4':
      await verifyAdmin();
      break;
    case '5':
      showStats();
      break;
    case '6':
      showMongoDBSetup();
      break;
    case '7':
      log.info('Goodbye! 👋');
      log.warning('To use the full admin system, set up MongoDB first!');
      rl.close();
      return;
    default:
      log.error('Invalid choice. Please try again.');
  }
  
  // Show menu again
  setTimeout(showMenu, 1000);
}

function showMongoDBSetup() {
  log.title('MONGODB SETUP INSTRUCTIONS');
  console.log('\n' + '='.repeat(70));
  console.log('🔧 To use the full admin system, you need MongoDB running.');
  console.log('');
  console.log('🌐 EASIEST OPTION - MongoDB Atlas (Free Cloud):');
  console.log('1. Go to: https://www.mongodb.com/atlas');
  console.log('2. Create free account');
  console.log('3. Create cluster');
  console.log('4. Get connection string');
  console.log('5. Update MONGO_URI in your .env file');
  console.log('');
  console.log('💻 LOCAL INSTALLATION:');
  console.log('1. Download: https://www.mongodb.com/try/download/community');
  console.log('2. Install MongoDB Community Server');
  console.log('3. Start service: net start MongoDB');
  console.log('4. Run: npm run setup-admin');
  console.log('');
  console.log('📖 See MONGODB_SETUP.md for detailed instructions');
  console.log('='.repeat(70) + '\n');
}

// Main function
async function main() {
  log.warning('MongoDB not connected - Running in DEMO mode');
  log.info('This demo shows how the admin system works');
  log.info('Set up MongoDB to use the full system');
  await showMenu();
}

// Handle process termination
process.on('SIGINT', () => {
  log.info('\nReceived SIGINT. Exiting demo...');
  rl.close();
  process.exit(0);
});

// Run the demo
main();
