const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Admin Schema
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

const Admin = mongoose.model('Admin', AdminSchema);

async function createSuperAdmin() {
  try {
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pomodoro_db';
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await Admin.findOne({ role: 'super-admin' });
    if (existingSuperAdmin) {
      console.log('⚠️  Super admin already exists:');
      console.log(`   Name: ${existingSuperAdmin.name}`);
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log('   Use the admin manager to create additional admins.');
      process.exit(0);
    }

    // Create default super admin
    const superAdmin = new Admin({
      name: 'Super Admin',
      email: 'admin@pomodoro.com',
      password: 'admin123456',
      role: 'super-admin'
    });

    await superAdmin.save();

    console.log('🎉 Super Admin created successfully!');
    console.log('='.repeat(50));
    console.log('👑 SUPER ADMIN CREDENTIALS');
    console.log('='.repeat(50));
    console.log('📧 Email: admin@pomodoro.com');
    console.log('🔒 Password: admin123456');
    console.log('👤 Name: Super Admin');
    console.log('🆔 ID:', superAdmin._id.toString());
    console.log('='.repeat(50));
    console.log('⚠️  IMPORTANT: Change the password immediately after first login!');
    console.log('💡 Use: npm run admin - to manage admin users');
    
  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

createSuperAdmin();
