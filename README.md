# FocusBloom - Pomodoro Timer App 🍅

A beautiful and intuitive Pomodoro timer app built with React Native and Expo.

## Features

- ⏰ Customizable timer sessions (Work, Short Break, Long Break)
- 📊 Session history and statistics
- 🎯 Beautiful, modern UI with dark theme
- 📱 Cross-platform (iOS & Android)
- 💾 Local data storage
- 🔄 Progress tracking

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI
- Expo Go app on your phone

### Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npx expo start
```

5. Scan the QR code with Expo Go on your phone

## Usage

1. **Timer Screen**: 
   - Select session type (Work/Short Break/Long Break)
   - Start/pause/reset timer
   - View session progress

2. **History Screen**:
   - View completed sessions
   - Check statistics and progress
   - Track your productivity

## Project Structure

```
FocusBloom/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx      # Timer screen
│   │   ├── explore.tsx    # History screen
│   │   └── _layout.tsx    # Tab navigation
│   └── _layout.tsx        # Root layout
├── context/
│   └── SessionContext.tsx # Global state management
├── services/
│   └── DataService.ts     # Local data storage
├── assets/               # Images and icons
└── screens/             # Original screen components
```

## Customization

You can customize the app by modifying:

- Session durations in the timer component
- Colors and themes in the StyleSheet
- Add new features or screens

## Technologies Used

- React Native
- Expo
- TypeScript
- AsyncStorage
- React Native Progress
- Expo Vector Icons

## License

MIT License
