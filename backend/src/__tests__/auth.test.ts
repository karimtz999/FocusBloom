import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { app } from '../server';
import User from '../models/User';

describe('Authentication Tests', () => {
  let server: any;
  const testUser = {
    email: 'test@example.com',
    username: 'testuser',
    password: 'password123'
  };

  beforeAll(async () => {
    // Create express app for testing
    server = app;
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(server)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.username).toBe(testUser.username);
      expect(response.body.user).not.toHaveProperty('password');

      // Verify user was saved to database
      const savedUser = await User.findOne({ email: testUser.email });
      expect(savedUser).toBeTruthy();
      expect(savedUser?.email).toBe(testUser.email);
      expect(savedUser?.username).toBe(testUser.username);
    });

    it('should not register user with invalid email', async () => {
      const invalidUser = {
        ...testUser,
        email: 'invalid-email'
      };

      const response = await request(server)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('validation failed');
    });

    it('should not register user with short password', async () => {
      const invalidUser = {
        ...testUser,
        email: 'test2@example.com',
        password: '123'
      };

      const response = await request(server)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('validation failed');
    });

    it('should not register user with duplicate email', async () => {
      // First registration
      await request(server)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      // Attempt duplicate registration
      const duplicateUser = {
        ...testUser,
        username: 'differentusername'
      };

      const response = await request(server)
        .post('/api/auth/register')
        .send(duplicateUser)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should not register user with duplicate username', async () => {
      // First registration
      await request(server)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      // Attempt duplicate registration
      const duplicateUser = {
        ...testUser,
        email: 'different@example.com'
      };

      const response = await request(server)
        .post('/api/auth/register')
        .send(duplicateUser)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should not register user with missing required fields', async () => {
      const incompleteUser = {
        email: 'test@example.com'
        // missing username and password
      };

      const response = await request(server)
        .post('/api/auth/register')
        .send(incompleteUser)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a user before each login test
      await request(server)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should login user with valid credentials', async () => {
      const loginData = {
        email: testUser.email,
        password: testUser.password
      };

      const response = await request(server)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.username).toBe(testUser.username);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should not login user with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: testUser.password
      };

      const response = await request(server)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should not login user with invalid password', async () => {
      const loginData = {
        email: testUser.email,
        password: 'wrongpassword'
      };

      const response = await request(server)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should not login user with missing email', async () => {
      const loginData = {
        password: testUser.password
      };

      const response = await request(server)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should not login user with missing password', async () => {
      const loginData = {
        email: testUser.email
      };

      const response = await request(server)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Password Security', () => {
    it('should hash passwords before saving to database', async () => {
      await request(server)
        .post('/api/auth/register')
        .send(testUser);

      const savedUser = await User.findOne({ email: testUser.email });
      expect(savedUser?.password).not.toBe(testUser.password);
      expect(savedUser?.password.length).toBeGreaterThan(50); // bcrypt hash length
    });

    it('should be able to compare passwords correctly', async () => {
      await request(server)
        .post('/api/auth/register')
        .send(testUser);

      const savedUser = await User.findOne({ email: testUser.email });
      const isMatch = await savedUser?.comparePassword(testUser.password);
      expect(isMatch).toBe(true);

      const isWrongMatch = await savedUser?.comparePassword('wrongpassword');
      expect(isWrongMatch).toBe(false);
    });
  });
});
