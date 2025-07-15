import express, { Request, Response } from 'express';
import { PomodoroSessionService } from '../models/PomodoroSessionService';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Create new pomodoro session
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { duration, type, notes } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in token' });
    }

    // Validate required fields
    if (!duration) {
      return res.status(400).json({
        message: 'validation failed',
        errors: [{ field: 'duration', message: 'Duration is required' }]
      });
    }

    const session = await PomodoroSessionService.create({
      userId,
      duration: duration || 25,
      type: type || 'work',
      startTime: new Date(),
      notes
    });

    res.status(201).json(session);

  } catch (error: any) {
    console.error('Session creation error:', error);
    
    res.status(500).json({
      message: 'Error creating session',
      error: error.message
    });
  }
});

// Complete a pomodoro session
router.put('/:sessionId/complete', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in token' });
    }

    // Find the session first to verify ownership
    const existingSession = await PomodoroSessionService.findById(sessionId);
    if (!existingSession) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (existingSession.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized to complete this session' });
    }

    if (existingSession.completed) {
      return res.status(400).json({ message: 'Session already completed' });
    }

    const session = await PomodoroSessionService.update(sessionId, {
      completed: true,
      endTime: new Date()
    });

    res.json(session);

  } catch (error: any) {
    console.error('Session completion error:', error);
    res.status(500).json({
      message: 'Error completing session',
      error: error.message
    });
  }
});

// Get user's pomodoro history
router.get('/history', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in token' });
    }

    const sessions = await PomodoroSessionService.findByUserId(userId);

    res.json(sessions);

  } catch (error: any) {
    console.error('History fetch error:', error);
    res.status(500).json({
      message: 'Error fetching history',
      error: error.message
    });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in token' });
    }

    const stats = await PomodoroSessionService.getStats(userId);

    res.json(stats);

  } catch (error: any) {
    console.error('Stats fetch error:', error);
    res.status(500).json({
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

export default router;
