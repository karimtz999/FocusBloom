import { Stack } from 'expo-router';
import { SessionProvider } from '../context/SessionContext';

export default function RootLayout() {
  return (
    <SessionProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SessionProvider>
  );
}
