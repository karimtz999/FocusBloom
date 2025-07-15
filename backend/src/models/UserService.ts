import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserService {
  static async create(data: CreateUserData): Promise<UserResponse> {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  static async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  static async findById(id: string): Promise<UserResponse | null> {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  static async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async getAll(): Promise<UserResponse[]> {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async getCount(): Promise<number> {
    return await prisma.user.count();
  }
}

export default UserService;
