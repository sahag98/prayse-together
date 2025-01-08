import { Stack } from 'expo-router';

export default function GroupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[id]/index" />
      <Stack.Screen name="[id]/start" options={{ animation: 'fade' }} />
    </Stack>
  );
}
