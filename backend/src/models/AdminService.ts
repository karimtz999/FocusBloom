import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Define AdminRole as string literals
type AdminRole = 'SUPER_ADMIN' | 'ADMIN';

// Constants for admin roles
const AdminRole = {
  SUPER_ADMIN: 'SUPER_ADMIN' as const,
  ADMIN: 'ADMIN' as const,
};

const prisma = new PrismaClient();

export interface CreateAdminData {
  email: string;
  password: string;
  name: string;
  role?: AdminRole;
}

export interface AdminResponse {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class AdminService {
  static async create(data: CreateAdminData): Promise<AdminResponse> {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    const admin = await prisma.admin.create({
      data: {
        ...data,
        password: hashedPassword,
        role: data.role || 'ADMIN',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return admin;
  }

  static async findByEmail(email: string) {
    return await prisma.admin.findUnique({
      where: { email },
    });
  }

  static async findById(id: string): Promise<AdminResponse | null> {
    return await prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateLastLogin(id: string): Promise<void> {
    await prisma.admin.update({
      where: { id },
      data: { lastLogin: new Date() },
    });
  }

  static async getAll(): Promise<AdminResponse[]> {
    return await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async getCount(): Promise<number> {
    return await prisma.admin.count();
  }

  static async getSuperAdminCount(): Promise<number> {
    return await prisma.admin.count({
      where: { role: 'SUPER_ADMIN' },
    });
  }

  static async getActiveCount(): Promise<number> {
    return await prisma.admin.count({
      where: { isActive: true },
    });
  }

  static async updateActive(id: string, isActive: boolean): Promise<AdminResponse> {
    return await prisma.admin.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async delete(id: string): Promise<void> {
    await prisma.admin.delete({
      where: { id },
    });
  }
}

export default AdminService;
