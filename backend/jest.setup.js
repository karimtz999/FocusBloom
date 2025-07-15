// Jest setup file
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config({ path: '.env.test' });

let mongod;

// Increase timeout for MongoDB operations
jest.setTimeout(30000);

// Setup test database connection
beforeAll(async () => {
  // Create in-memory MongoDB instance
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  await mongoose.connect(uri);
});

// Cleanup after tests
afterAll(async () => {
  // Clear all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  
  // Close database connection
  await mongoose.connection.close();
  
  // Stop the in-memory MongoDB instance
  if (mongod) {
    await mongod.stop();
  }
});

// Clear collections before each test
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
