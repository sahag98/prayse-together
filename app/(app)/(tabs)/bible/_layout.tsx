import { Stack } from 'expo-router';

export default function BibleLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ animation: 'fade' }} />
    </Stack>
  );
}
