import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AdminService } from '../models/AdminService';
import { UserService } from '../models/UserService';
import { PomodoroSessionService } from '../models/PomodoroSessionService';
import { AdminRole } from '../generated/prisma';

const router = express.Router();

// All admin authentication and protected routes removed

// Create new admin (super admin only)
// Route removed

// Toggle admin active status (super admin only)
// Route removed

// Delete admin (super admin only)
// Route removed

export default router;
