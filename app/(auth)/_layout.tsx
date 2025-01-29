import { Redirect, Stack } from 'expo-router';
import { useNotificationObserver } from '~/hooks/useNotificationObserver';
import { useAuth } from '~/providers/auth-provider';

export default function AuthRoutesLayout() {
  const { currentUser } = useAuth();

  if (currentUser) return <Redirect href="/(app)/(tabs)" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    />
  );
}
