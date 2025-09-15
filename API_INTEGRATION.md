# FocusBloom API Integration

This document explains the API integration implemented for the FocusBloom Pomodoro timer app.

## Overview

The app now includes a complete API integration system with offline support for session management. When online, sessions are synchronized with your server; when offline, they're stored locally and synced when connectivity is restored.

## Files Added/Modified

### API Layer (`/api/`)

- **`api.ts`** - Main API configuration and session endpoints
- **`config.ts`** - API configuration settings and constants
- **`networkUtils.ts`** - Network connectivity and offline request queue management

### Session Management (`/screens/`)

- **`sessionManager.ts`** - Enhanced session logic with API integration and offline support

### Timer Integration (`/screens/`)

- **`TimerScreen.tsx`** - Updated to use the new session manager with API calls

## Features

### 1. Session Creation
- Creates sessions via API when online
- Falls back to local storage when offline
- Queues requests for later sync when offline

### 2. Session Completion
- Completes sessions via API with real-time stats
- Syncs with local storage for redundancy
- Handles offline completion gracefully

### 3. Offline Support
- Automatic request queuing when offline
- Local storage fallback for all operations
- Automatic sync when connectivity is restored

### 4. Network Management
- Connection status monitoring
- Retry logic for failed requests
- Request timeout handling

## Configuration

### API Base URL

Update the API base URL in `/api/config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://your-api-endpoint.com/api',
  // ... other config
};
```

### Environment Variables

You can set the API URL using environment variables:

```bash
EXPO_PUBLIC_API_URL=https://your-api-endpoint.com/api
```

## API Endpoints

The app expects the following RESTful endpoints:

### Sessions

- **POST** `/sessions` - Create a new session
  ```json
  {
    "duration": 25,
    "type": "work",
    "startTime": "2025-01-24T10:00:00.000Z"
  }
  ```

- **PUT** `/sessions/:id` - Complete a session
  ```json
  {
    "completed": true,
    "endTime": "2025-01-24T10:25:00.000Z"
  }
  ```

- **GET** `/sessions` - Get all user sessions
  ```json
  {
    "success": true,
    "data": {
      "sessions": [...]
    }
  }
  ```

- **GET** `/sessions/stats` - Get session statistics
  ```json
  {
    "success": true,
    "data": {
      "stats": {
        "totalSessions": 10,
        "completedSessions": 8,
        "totalMinutes": 200,
        "workSessions": 6,
        "breakSessions": 2
      }
    }
  }
  ```

- **DELETE** `/sessions/:id` - Delete a session

### Response Format

All API responses should follow this format:

```json
{
  "success": boolean,
  "data": any,
  "message": string,
  "error": string
}
```

## Authentication

The app supports Bearer token authentication. Tokens are stored securely in AsyncStorage and automatically included in API requests.

To set an auth token:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_TOKEN_KEY } from './api/config';

await AsyncStorage.setItem(AUTH_TOKEN_KEY, 'your-jwt-token');
```

## Development Mode

In development mode:
- API calls fall back to mock responses
- Extensive logging is enabled
- Request timeouts are more forgiving

## Usage Examples

### Starting a Session

```typescript
import { startPomodoroSession } from './screens/sessionManager';

try {
  const session = await startPomodoroSession(25, 'work');
  console.log('Session started:', session.id);
} catch (error) {
  console.error('Failed to start session:', error);
}
```

### Completing a Session

```typescript
import { completePomodoroSession } from './screens/sessionManager';

try {
  const result = await completePomodoroSession(sessionId);
  console.log('Session completed:', result.session);
  console.log('Updated stats:', result.stats);
} catch (error) {
  console.error('Failed to complete session:', error);
}
```

### Syncing Offline Data

```typescript
import { syncSessionsWithAPI, getNetworkStatus } from './screens/sessionManager';

const status = await getNetworkStatus();
if (status.canSync) {
  await syncSessionsWithAPI();
  console.log('Sync completed');
}
```

## Error Handling

The API layer includes comprehensive error handling:

- Network timeouts
- HTTP error codes
- JSON parsing errors
- Authentication failures
- Retry logic with exponential backoff

## Testing

To test the API integration:

1. **Online Mode**: Set a valid API base URL and test normal operations
2. **Offline Mode**: Disable network and verify local storage fallback
3. **Reconnection**: Go offline, perform actions, then reconnect to test sync

## Server Implementation

For a complete server implementation, you'll need:

1. RESTful API endpoints matching the expected interface
2. User authentication system
3. Database for session storage
4. CORS configuration for mobile clients

Example server endpoints (Node.js/Express):

```javascript
// POST /api/sessions
app.post('/api/sessions', authenticate, async (req, res) => {
  const { duration, type, startTime } = req.body;
  const session = await Session.create({
    userId: req.user.id,
    duration,
    type,
    startTime,
    completed: false
  });
  res.json({ success: true, data: { session } });
});

// PUT /api/sessions/:id
app.put('/api/sessions/:id', authenticate, async (req, res) => {
  const session = await Session.findByIdAndUpdate(
    req.params.id,
    { completed: true, endTime: req.body.endTime },
    { new: true }
  );
  res.json({ success: true, data: { session } });
});
```

## Security Considerations

- All API calls use HTTPS in production
- Authentication tokens are stored securely
- Request/response data is validated
- Rate limiting should be implemented on the server
- User data is properly sanitized

## Performance

- Request queuing prevents duplicate API calls
- Local storage provides instant fallback
- Background sync minimizes user-facing delays
- Efficient data structures for offline queue management
