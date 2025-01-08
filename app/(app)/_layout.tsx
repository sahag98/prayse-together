import React from 'react';
import { useNetworkState } from 'expo-network';
import { Redirect, router, Stack } from 'expo-router';
import { Alert } from 'react-native';
import { useAuth } from '~/providers/auth-provider';
import * as Notifications from 'expo-notifications';
import { useNotificationObserver } from '~/hooks/useNotificationObserver';
export const unstable_settings = {
  initialRouteName: 'index',
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function AppIndexLayout() {
  const { currentUser, session } = useAuth();
  useNotificationObserver();

  const networkState = useNetworkState();
  React.useEffect(() => {
    if (!networkState.isConnected && networkState.isInternetReachable === false) {
      Alert.alert(
        '🔌 You are offline',
        'You can keep using the app to only do personal bible studies until you get back online.'
      );
    }
  }, [networkState.isConnected, networkState.isInternetReachable]);

  if (!currentUser) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="group"
        options={{
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          presentation: 'modal',
          sheetAllowedDetents: [0.75, 1],
          sheetGrabberVisible: true,
          headerShown: false,
        }}
      />
    </Stack>
  );
}
