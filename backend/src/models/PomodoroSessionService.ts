import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateSessionData {
  userId: string;
  duration: number;
  type?: string;
  startTime: Date;
  notes?: string;
}

export interface UpdateSessionData {
  completed?: boolean;
  endTime?: Date;
  notes?: string;
}

export interface SessionResponse {
  id: string;
  userId: string;
  duration: number;
  type: string;
  completed: boolean;
  startTime: Date;
  endTime: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export class PomodoroSessionService {
  static async create(data: CreateSessionData): Promise<SessionResponse> {
    const session = await prisma.pomodoroSession.create({
      data: {
        userId: data.userId,
        duration: data.duration,
        type: data.type || 'work',
        startTime: data.startTime,
        notes: data.notes,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return session;
  }

  static async findById(id: string): Promise<SessionResponse | null> {
    return await prisma.pomodoroSession.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  static async update(id: string, data: UpdateSessionData): Promise<SessionResponse> {
    const session = await prisma.pomodoroSession.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return session;
  }

  static async findByUserId(userId: string): Promise<SessionResponse[]> {
    return await prisma.pomodoroSession.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async getStats(userId?: string) {
    const whereClause = userId ? { userId } : {};

    const [totalSessions, completedSessions, totalTime] = await Promise.all([
      prisma.pomodoroSession.count({
        where: whereClause,
      }),
      prisma.pomodoroSession.count({
        where: {
          ...whereClause,
          completed: true,
        },
      }),
      prisma.pomodoroSession.aggregate({
        where: {
          ...whereClause,
          completed: true,
        },
        _sum: {
          duration: true,
        },
      }),
    ]);

    return {
      totalSessions,
      completedSessions,
      totalTime: totalTime._sum.duration || 0,
      completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
    };
  }

  static async getAll(): Promise<SessionResponse[]> {
    return await prisma.pomodoroSession.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

export default PomodoroSessionService;
