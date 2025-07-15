
# FocusBloom

FocusBloom is a modern Pomodoro timer and productivity app with user authentication, admin dashboard, and session analytics. Built with React Native (Expo) for the frontend and Node.js/Express with Prisma for the backend, it helps users manage their focus sessions and track productivity.

## Features

- Pomodoro timer for focus sessions
- Session analytics and history
- Beautiful, responsive UI

## Tech Stack

- **Frontend:** React Native (Expo)
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (via Prisma ORM)

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- PostgreSQL (for backend)

### Installation

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd PomodoroApp
   ```

2. **Install dependencies:**
   ```sh
   npm install
   cd backend
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` in the backend folder and fill in your database and JWT secrets.

4. **Run database migrations:**
   ```sh
   cd backend
   npx prisma migrate dev
   ```

5. **Start the backend server:**
   ```sh
   npm start
   ```

6. **Start the Expo app:**
   ```sh
   cd ..
   expo start
   ```

## Usage

- Start Pomodoro sessions, view history, and track productivity.

## Folder Structure

- `app/` - React Native frontend
- `backend/` - Node.js/Express backend
- `screens/` - App screens (Timer, History)
- `context/` - (no authentication)
- `api/` - API calls

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)
