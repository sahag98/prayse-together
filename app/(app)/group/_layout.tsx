import { Stack } from 'expo-router';
import { useTheme } from '~/providers/theme-provider';

export default function GroupLayout() {
  const { colorScheme } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colorScheme === 'dark' ? '#121212' : '#faf9f6' },
      }}>
      <Stack.Screen name="[id]/index" />
      <Stack.Screen name="[id]/start" options={{ animation: 'fade' }} />
    </Stack>
  );
}
