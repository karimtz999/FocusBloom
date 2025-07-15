const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const readline = require('readline');
require('dotenv').config();

// Admin Schema (duplicated here for the script)
const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  role: {
    type: String,
    enum: ['super-admin', 'admin'],
    default: 'admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date
}, {
  timestamps: true
});

// Hash password before saving
AdminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
AdminSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model('Admin', AdminSchema);

// User Schema for displaying users
const UserSchema = new mongoose.Schema({
  email: String,
  username: String,
  createdAt: Date
});

const User = mongoose.model('User', UserSchema);

// Readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Utility function to ask questions
const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
};

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

// Connect to MongoDB
async function connectDB() {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pomodoro_db';
    await mongoose.connect(MONGO_URI);
    log.success('Connected to MongoDB');
  } catch (error) {
    log.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
}

// Create admin user
async function createAdmin() {
  log.title('CREATE NEW ADMIN USER');
  
  try {
    const name = await question('👤 Enter admin name: ');
    const email = await question('📧 Enter admin email: ');
    const password = await question('🔒 Enter admin password (min 8 chars): ');
    const roleInput = await question('👑 Enter role (admin/super-admin) [admin]: ');
    
    const role = roleInput.toLowerCase() === 'super-admin' ? 'super-admin' : 'admin';
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      log.error('Admin with this email already exists!');
      return;
    }
    
    // Create new admin
    const admin = new Admin({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role
    });
    
    await admin.save();
    log.success(`Admin user created successfully!`);
    log.admin(`Name: ${admin.name}`);
    log.admin(`Email: ${admin.email}`);
    log.admin(`Role: ${admin.role}`);
    log.admin(`ID: ${admin._id}`);
    
  } catch (error) {
    log.error(`Failed to create admin: ${error.message}`);
  }
}

// List all admins
async function listAdmins() {
  log.title('ALL ADMIN USERS');
  
  try {
    const admins = await Admin.find({}).select('-password').sort({ createdAt: -1 });
    
    if (admins.length === 0) {
      log.warning('No admin users found');
      return;
    }
    
    console.log('\n' + '='.repeat(80));
    admins.forEach((admin, index) => {
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
      console.log(`   🆔 ID: ${admin._id}`);
      console.log('   ' + '-'.repeat(60));
    });
    console.log('='.repeat(80) + '\n');
    
    log.info(`Total admins: ${admins.length}`);
    
  } catch (error) {
    log.error(`Failed to fetch admins: ${error.message}`);
  }
}

// List all regular users
async function listUsers() {
  log.title('ALL REGULAR USERS');
  
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    
    if (users.length === 0) {
      log.warning('No users found');
      return;
    }
    
    console.log('\n' + '='.repeat(80));
    users.forEach((user, index) => {
      console.log(`${colors.green}${index + 1}. ${user.username}${colors.reset}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   📅 Joined: ${user.createdAt ? user.createdAt.toLocaleDateString() : 'Unknown'}`);
      console.log(`   🆔 ID: ${user._id}`);
      console.log('   ' + '-'.repeat(60));
    });
    console.log('='.repeat(80) + '\n');
    
    log.info(`Total users: ${users.length}`);
    
  } catch (error) {
    log.error(`Failed to fetch users: ${error.message}`);
  }
}

// Delete admin
async function deleteAdmin() {
  log.title('DELETE ADMIN USER');
  
  try {
    const admins = await Admin.find({}).select('-password');
    
    if (admins.length === 0) {
      log.warning('No admin users found to delete');
      return;
    }
    
    // Show admins list
    console.log('\nExisting admins:');
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} (${admin.email}) - ${admin.role}`);
    });
    
    const choice = await question('\nEnter admin number to delete (or 0 to cancel): ');
    const adminIndex = parseInt(choice) - 1;
    
    if (choice === '0') {
      log.info('Operation cancelled');
      return;
    }
    
    if (isNaN(adminIndex) || adminIndex < 0 || adminIndex >= admins.length) {
      log.error('Invalid choice');
      return;
    }
    
    const adminToDelete = admins[adminIndex];
    const confirm = await question(`Are you sure you want to delete ${adminToDelete.name} (${adminToDelete.email})? (yes/no): `);
    
    if (confirm.toLowerCase() !== 'yes') {
      log.info('Operation cancelled');
      return;
    }
    
    await Admin.findByIdAndDelete(adminToDelete._id);
    log.success(`Admin ${adminToDelete.name} deleted successfully!`);
    
  } catch (error) {
    log.error(`Failed to delete admin: ${error.message}`);
  }
}

// Verify admin credentials
async function verifyAdmin() {
  log.title('VERIFY ADMIN CREDENTIALS');
  
  try {
    const email = await question('📧 Enter admin email: ');
    const password = await question('🔒 Enter admin password: ');
    
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    
    if (!admin) {
      log.error('Admin not found!');
      return;
    }
    
    const isValid = await admin.comparePassword(password);
    
    if (isValid) {
      log.success('✅ Credentials are valid!');
      log.admin(`Name: ${admin.name}`);
      log.admin(`Role: ${admin.role}`);
      log.admin(`Status: ${admin.isActive ? 'Active' : 'Inactive'}`);
      
      // Update last login
      admin.lastLogin = new Date();
      await admin.save();
      
    } else {
      log.error('❌ Invalid credentials!');
    }
    
  } catch (error) {
    log.error(`Verification failed: ${error.message}`);
  }
}

// Show statistics
async function showStats() {
  log.title('SYSTEM STATISTICS');
  
  try {
    const adminCount = await Admin.countDocuments();
    const activeAdminCount = await Admin.countDocuments({ isActive: true });
    const superAdminCount = await Admin.countDocuments({ role: 'super-admin' });
    const userCount = await User.countDocuments();
    
    console.log('\n' + '='.repeat(50));
    log.info(`👑 Total Admins: ${adminCount}`);
    log.info(`🟢 Active Admins: ${activeAdminCount}`);
    log.info(`👑 Super Admins: ${superAdminCount}`);
    log.info(`👥 Regular Users: ${userCount}`);
    console.log('='.repeat(50) + '\n');
    
  } catch (error) {
    log.error(`Failed to fetch statistics: ${error.message}`);
  }
}

// Main menu
async function showMenu() {
  console.log('\n' + '='.repeat(60));
  log.title('POMODORO ADMIN MANAGEMENT SYSTEM');
  console.log('='.repeat(60));
  console.log('1. 👤 Create Admin User');
  console.log('2. 📋 List All Admins');
  console.log('3. 👥 List All Users');
  console.log('4. 🗑️  Delete Admin');
  console.log('5. 🔐 Verify Admin Credentials');
  console.log('6. 📊 Show Statistics');
  console.log('7. 🚪 Exit');
  console.log('='.repeat(60));
  
  const choice = await question('Enter your choice (1-7): ');
  
  switch (choice) {
    case '1':
      await createAdmin();
      break;
    case '2':
      await listAdmins();
      break;
    case '3':
      await listUsers();
      break;
    case '4':
      await deleteAdmin();
      break;
    case '5':
      await verifyAdmin();
      break;
    case '6':
      await showStats();
      break;
    case '7':
      log.info('Goodbye! 👋');
      rl.close();
      mongoose.connection.close();
      return;
    default:
      log.error('Invalid choice. Please try again.');
  }
  
  // Show menu again
  setTimeout(showMenu, 1000);
}

// Main function
async function main() {
  try {
    await connectDB();
    await showMenu();
  } catch (error) {
    log.error(`Application error: ${error.message}`);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log.info('\nReceived SIGINT. Closing connections...');
  rl.close();
  mongoose.connection.close();
  process.exit(0);
});

// Run the application
main();
