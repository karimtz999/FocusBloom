#!/usr/bin/env node

// Simple test script to verify the backend setup
const path = require('path');
const fs = require('fs');

console.log('🧪 Testing Pomodoro Backend Setup...\n');

// Check if all required files exist
const filesToCheck = [
  'dist/server.js',
  'src/server.ts',
  'src/models/User.ts',
  'src/models/PomodoroSession.ts',
  'src/routes/authRoutes.ts',
  'src/routes/sessionRoutes.ts',
  'src/middleware/auth.ts',
  '.env',
  'package.json'
];

console.log('📁 Checking required files:');
filesToCheck.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Check dependencies
console.log('\n📦 Checking key dependencies:');
const package = require('./package.json');
const keyDeps = ['express', 'mongoose', 'bcrypt', 'jsonwebtoken', 'cors'];
keyDeps.forEach(dep => {
  const exists = package.dependencies[dep];
  console.log(`${exists ? '✅' : '❌'} ${dep} ${exists ? '(' + exists + ')' : ''}`);
});

console.log('\n🎉 Backend setup verification complete!');
console.log('\n🚀 To start the server:');
console.log('   1. Make sure MongoDB is running');
console.log('   2. Update .env with your MongoDB URI');
console.log('   3. Run: node dist/server.js');
console.log('\n📡 API will be available at: http://localhost:5000');
console.log('🔍 Health check: http://localhost:5000/api/health');
