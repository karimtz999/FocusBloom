import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PomodoroSession {
  _id: string;
  duration: number;
  type: 'work' | 'short-break' | 'long-break';
  completed: boolean;
  startTime: string;
  endTime?: string;
  createdAt: string;
  category?: string; // Added optional category to aggregate minutes by category (e.g., study, coding, break)
}

export interface SessionStats {
  totalSessions: number;
  completedSessions: number;
  totalMinutes: number;
  workSessions: number;
  breakSessions: number;
}

class DataService {
  private static instance: DataService;
  private readonly SESSIONS_KEY = 'pomodoro_sessions';

  private constructor() {}

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  async addSession(sessionData: Omit<PomodoroSession, '_id' | 'createdAt'>): Promise<PomodoroSession> {
    try {
      const sessions = await this.getSessions();
      const newSession: PomodoroSession = {
        ...sessionData,
        _id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      
      sessions.push(newSession);
      await AsyncStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
      return newSession;
    } catch (error) {
      console.error('Error adding session:', error);
      throw error;
    }
  }

  async getSessions(): Promise<PomodoroSession[]> {
    try {
      const sessionsJson = await AsyncStorage.getItem(this.SESSIONS_KEY);
      return sessionsJson ? JSON.parse(sessionsJson) : [];
    } catch (error) {
      console.error('Error getting sessions:', error);
      return [];
    }
  }

  async getStats(): Promise<SessionStats> {
    try {
      const sessions = await this.getSessions();
      const completed = sessions.filter(s => s.completed);
      
      return {
        totalSessions: sessions.length,
        completedSessions: completed.length,
        totalMinutes: completed.reduce((total, session) => total + session.duration, 0),
        workSessions: completed.filter(s => s.type === 'work').length,
        breakSessions: completed.filter(s => s.type !== 'work').length,
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        totalSessions: 0,
        completedSessions: 0,
        totalMinutes: 0,
        workSessions: 0,
        breakSessions: 0,
      };
    }
  }

  async clearSessions(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.SESSIONS_KEY);
    } catch (error) {
      console.error('Error clearing sessions:', error);
      throw error;
    }
  }
}

export default DataService;
