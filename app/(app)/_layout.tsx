import React from 'react';
import { useNetworkState } from 'expo-network';
import { Redirect, router, Stack } from 'expo-router';
import { Alert } from 'react-native';
import { useAuth } from '~/providers/auth-provider';
import * as Notifications from 'expo-notifications';
import { useNotificationObserver } from '~/hooks/useNotificationObserver';

import { useTheme } from '~/providers/theme-provider';
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

  const { colorScheme } = useTheme();
  useNotificationObserver();

  const networkState = useNetworkState();
  React.useEffect(() => {
    if (!networkState.isConnected && networkState.isInternetReachable === false) {
      Alert.alert(
        '📶 Oops! No Internet',
        'Looks like you’re offline. Please reconnect and try again. We’ll be here when you’re back! 😊'
      );
    }
  }, [networkState.isConnected, networkState.isInternetReachable]);

  if (!currentUser) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <>
      {/* <StatusBar style="light" /> */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="group" />
        <Stack.Screen
          name="profile"
          options={{
            presentation: 'modal',
            sheetAllowedDetents: [0.75, 1],
            sheetGrabberVisible: true,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="emoji-picker"
          options={{
            presentation: 'formSheet',
            headerShown: false,
            sheetAllowedDetents: [0.5, 0.75, 1],
            sheetGrabberVisible: true,
          }}
        />
      </Stack>
    </>
  );
}
