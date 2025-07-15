import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes';
import sessionRoutes from './routes/sessionRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['your-production-domain.com'] 
    : true, // Allow all origins in development
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req: express.Request, res: express.Response) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Start server (no database connection needed with Prisma)
if (process.env.NODE_ENV !== 'test') {
  console.log('� Starting Pomodoro API Server...');
  console.log('� Environment:', process.env.NODE_ENV || 'development');
  console.log('🗃️  Database: PostgreSQL with Prisma ORM');
  
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 API endpoints available at: http://localhost:${PORT}/api`);
    console.log('💡 Make sure PostgreSQL is running and DATABASE_URL is set');
  });
}

export { app };
export default app;
