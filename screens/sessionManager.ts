// sessionManager.ts
// Handles Pomodoro session logic for TimerScreen

import { sessionAPI } from '../api/api';

export async function startPomodoroSession(duration: number, type: 'work' | 'short-break' | 'long-break') {
  // Returns the created session or throws error
  const response = await sessionAPI.create(duration, type);
  return response.data.session;
}

export async function completePomodoroSession(sessionId: string) {
  // Marks a session as complete
  return sessionAPI.complete(sessionId);
}
