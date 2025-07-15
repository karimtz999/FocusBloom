import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AdminService } from '../models/AdminService';
import { UserService } from '../models/UserService';
import { PomodoroSessionService } from '../models/PomodoroSessionService';

// Define AdminRole type and constants
type AdminRole = 'SUPER_ADMIN' | 'ADMIN';
const AdminRole = {
  SUPER_ADMIN: 'SUPER_ADMIN' as const,
  ADMIN: 'ADMIN' as const,
};

const router = express.Router();

// All admin authentication and protected routes removed

// Create new admin (super admin only)
// Route removed

// Toggle admin active status (super admin only)
// Route removed

// Delete admin (super admin only)
// Route removed

export default router;
