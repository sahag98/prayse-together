import { Redirect, Stack } from 'expo-router';
import { useNotificationObserver } from '~/hooks/useNotificationObserver';
import { useAuth } from '~/providers/auth-provider';

export default function AuthRoutesLayout() {
  const { currentUser, session } = useAuth();

  console.log('hereeee');

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
