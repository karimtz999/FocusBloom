# Pomodoro Timer Backend API

A robust Node.js + Express backend for the Pomodoro Timer app with TypeScript, MongoDB, and JWT authentication.

## 🚀 Features

- **User Authentication** - Register, login, JWT tokens
- **Session Tracking** - Track Pomodoro sessions (work, short break, long break)
- **Statistics** - Session history and productivity stats
- **Security** - Helmet, CORS, rate limiting, bcrypt password hashing
- **TypeScript** - Full type safety
- **MongoDB** - Persistent data storage

## 📦 Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your MongoDB URI and JWT secret.

3. **Start development server:**
   ```bash
   npm run dev
   ```

## 🛠️ Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run clean` - Clean build directory

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Sessions
- `POST /api/sessions` - Create new Pomodoro session (protected)
- `PATCH /api/sessions/:id/complete` - Mark session as complete (protected)
- `GET /api/sessions/history` - Get session history (protected)
- `GET /api/sessions/stats` - Get productivity statistics (protected)

### Health
- `GET /api/health` - Health check endpoint

## 🔧 Environment Variables

Create a `.env` file with:

```
MONGO_URI=mongodb://localhost:27017/pomodoro_db
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
PORT=5000
```

## 🗄️ Database Models

### User
- email (unique)
- username (unique)
- password (hashed)
- timestamps

### PomodoroSession
- userId (reference to User)
- duration (25, 15, or 5 minutes)
- type (work, short-break, long-break)
- completed (boolean)
- startTime, endTime
- timestamps

## 🔐 Security Features

- Password hashing with bcrypt
- JWT authentication
- CORS protection
- Rate limiting (100 requests per 15 minutes)
- Helmet security headers
- Input validation

## 🚀 Production Deployment

1. Build the project: `npm run build`
2. Set production environment variables
3. Start with: `npm start`

Make sure MongoDB is running and accessible!
