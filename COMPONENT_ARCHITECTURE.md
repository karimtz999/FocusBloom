# FocusBloom Component Architecture

## Overview
The main `index.tsx` file has been refactored into smaller, modular components for better maintainability and code organization.

## New Structure

### 📁 `/hooks/`
Custom React hooks for logic separation:

- **`useTimer.ts`** - Manages all timer-related state and logic
  - Timer countdown functionality
  - Session management (start, complete, reset)
  - API integration for session tracking
  - Pomodoro technique logic (work/break cycles)

- **`useProfileImage.ts`** - Handles profile image management
  - Image picker functionality (camera/gallery)
  - Image storage and retrieval
  - Profile image deletion

### 📁 `/screens/home/`
UI components for the home screen:

- **`HeaderSection.tsx`** - App header component
  - Profile image display
  - App title and subtitle
  - Clean, minimal layout

- **`SessionSelector.tsx`** - Session type picker
  - Work/Short Break/Long Break buttons
  - Active state styling
  - Session type switching logic

- **`TimerDisplay.tsx`** - Main timer visual component
  - Circular progress indicator
  - Time display formatting
  - Session type and count display
  - Responsive circular design

- **`ControlButtons.tsx`** - Timer control interface
  - Play/Pause button
  - Reset button
  - Consistent button styling

## Main Index File

### `app/(tabs)/index.tsx`
Now a clean, simple composition of components:
- Imports and uses custom hooks
- Renders organized component sections
- Minimal styling (only container)
- Easy to read and maintain

## Benefits

### ✅ **Modularity**
- Each component has a single responsibility
- Components can be reused elsewhere
- Easy to test individual components

### ✅ **Maintainability** 
- Logic separated from UI
- Smaller files are easier to navigate
- Clear component interfaces

### ✅ **Reusability**
- Components can be used in other screens
- Hooks can be shared across the app
- Consistent styling patterns

### ✅ **Type Safety**
- Clear prop interfaces for each component
- Better TypeScript support
- Compile-time error checking

## Usage Example

```tsx
// Simple, clean main component
export default function HomeScreen() {
  const timer = useTimer();
  const profile = useProfileImage();

  return (
    <View style={styles.container}> 
      <HeaderSection 
        profileImage={profile.profileImage}
        onProfilePress={profile.showImagePickerOptions}
      />
      <SessionSelector 
        sessionType={timer.sessionType}
        onSessionTypeChange={timer.changeSessionType}
      />
      <TimerDisplay 
        timeLeft={timer.timeLeft}
        sessionType={timer.sessionType}
        sessionCount={timer.sessionCount}
        progress={timer.progress}
      />
      <ControlButtons 
        isRunning={timer.isRunning}
        onToggleTimer={timer.toggleTimer}
        onResetTimer={timer.resetTimer}
      />
    </View>
  );
}
```

This architecture makes the codebase much more maintainable and follows React best practices for component composition and separation of concerns.
