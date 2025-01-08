import { Stack } from 'expo-router';

export default function NextLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ animation: 'fade' }} />
    </Stack>
  );
}
