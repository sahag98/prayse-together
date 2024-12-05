import AuthProvider from '~/providers/auth-provider';
import '../global.css';

import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
