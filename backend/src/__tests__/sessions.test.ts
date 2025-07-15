import request from 'supertest';
import { app } from '../server';
import User from '../models/User';
import PomodoroSession from '../models/PomodoroSession';

describe('Session Tests', () => {
  let server: any;
  let authToken: string;
  let userId: string;

  const testUser = {
    email: 'session@example.com',
    username: 'sessionuser',
    password: 'password123'
  };

  beforeAll(async () => {
    server = app;
  });

  beforeEach(async () => {
    // Register and login user to get auth token
    const registerResponse = await request(server)
      .post('/api/auth/register')
      .send(testUser);

    authToken = registerResponse.body.token;
    userId = registerResponse.body.user.id;
  });

  describe('POST /api/sessions', () => {
    it('should create a new pomodoro session', async () => {
      const sessionData = {
        type: 'work',
        duration: 25,
        startTime: new Date().toISOString()
      };

      const response = await request(server)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sessionData)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.type).toBe(sessionData.type);
      expect(response.body.duration).toBe(sessionData.duration);
      expect(response.body.userId).toBe(userId);
      expect(response.body.completed).toBe(false);

      // Verify session was saved to database
      const savedSession = await PomodoroSession.findById(response.body._id);
      expect(savedSession).toBeTruthy();
    });

    it('should not create session without auth token', async () => {
      const sessionData = {
        type: 'work',
        duration: 25,
        startTime: new Date().toISOString()
      };

      const response = await request(server)
        .post('/api/sessions')
        .send(sessionData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should not create session with invalid data', async () => {
      const invalidSessionData = {
        type: 'invalid-type',
        duration: -5, // negative duration
        startTime: 'invalid-date'
      };

      const response = await request(server)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidSessionData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PUT /api/sessions/:id/complete', () => {
    let sessionId: string;

    beforeEach(async () => {
      // Create a session first
      const sessionData = {
        type: 'work',
        duration: 25,
        startTime: new Date().toISOString()
      };

      const createResponse = await request(server)
        .post('/api/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sessionData);

      sessionId = createResponse.body._id;
    });

    it('should complete a session successfully', async () => {
      const completeData = {
        endTime: new Date().toISOString(),
        completed: true
      };

      const response = await request(server)
        .put(`/api/sessions/${sessionId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(completeData)
        .expect(200);

      expect(response.body.completed).toBe(true);
      expect(response.body.endTime).toBeDefined();

      // Verify in database
      const updatedSession = await PomodoroSession.findById(sessionId);
      expect(updatedSession?.completed).toBe(true);
      expect(updatedSession?.endTime).toBeDefined();
    });

    it('should not complete session without auth', async () => {
      const completeData = {
        endTime: new Date().toISOString(),
        completed: true
      };

      const response = await request(server)
        .put(`/api/sessions/${sessionId}/complete`)
        .send(completeData)
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });

    it('should not complete session that does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
      const completeData = {
        endTime: new Date().toISOString(),
        completed: true
      };

      const response = await request(server)
        .put(`/api/sessions/${fakeId}/complete`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(completeData)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/sessions/history', () => {
    beforeEach(async () => {
      // Create multiple sessions for testing
      const sessions = [
        { type: 'work', duration: 25, startTime: new Date().toISOString(), completed: true },
        { type: 'short-break', duration: 5, startTime: new Date().toISOString(), completed: true },
        { type: 'work', duration: 25, startTime: new Date().toISOString(), completed: false }
      ];

      for (const session of sessions) {
        await request(server)
          .post('/api/sessions')
          .set('Authorization', `Bearer ${authToken}`)
          .send(session);
      }
    });

    it('should get user session history', async () => {
      const response = await request(server)
        .get('/api/sessions/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);
      
      // Should be sorted by most recent first
      const timestamps = response.body.map((s: any) => new Date(s.createdAt).getTime());
      const sortedTimestamps = [...timestamps].sort((a, b) => b - a);
      expect(timestamps).toEqual(sortedTimestamps);
    });

    it('should not get history without auth', async () => {
      const response = await request(server)
        .get('/api/sessions/history')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/sessions/stats', () => {
    beforeEach(async () => {
      // Create sessions with known data for stats testing
      const now = new Date();
      const sessions = [
        { 
          type: 'work', 
          duration: 25, 
          startTime: now.toISOString(), 
          completed: true,
          endTime: new Date(now.getTime() + 25 * 60 * 1000).toISOString()
        },
        { 
          type: 'work', 
          duration: 25, 
          startTime: now.toISOString(), 
          completed: true,
          endTime: new Date(now.getTime() + 25 * 60 * 1000).toISOString()
        }
      ];

      for (const session of sessions) {
        await request(server)
          .post('/api/sessions')
          .set('Authorization', `Bearer ${authToken}`)
          .send(session);
      }
    });

    it('should get user session statistics', async () => {
      const response = await request(server)
        .get('/api/sessions/stats?period=week')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      // Should have stats for work sessions
      const workStats = response.body.find((stat: any) => stat._id === 'work');
      expect(workStats).toBeDefined();
      expect(workStats.count).toBe(2);
      expect(workStats.totalMinutes).toBe(50);
    });

    it('should not get stats without auth', async () => {
      const response = await request(server)
        .get('/api/sessions/stats?period=week')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });
});
