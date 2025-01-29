import AuthProvider from '~/providers/auth-provider';
import '../global.css';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Slot, Stack, useNavigationContainerRef } from 'expo-router';
import * as Sentry from '@sentry/react-native';
import { isRunningInExpoGo } from 'expo';
import { useCallback, useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Appearance, ColorSchemeName, Text, useColorScheme, View } from 'react-native';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { DarkTheme, DefaultTheme, Theme, ThemeProvider } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomThemeProvider, { useTheme } from '~/providers/theme-provider';
import { StatusBar } from 'expo-status-bar';

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

Sentry.init({
  dsn: 'https://f3d74c203d3c13d0ae7f71bf298609c7@o4506981596594176.ingest.us.sentry.io/4508491783995392',
  debug: false, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
  tracesSampleRate: 1.0, // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing. Adjusting this value in production.
  integrations: [
    // Pass integration
    navigationIntegration,
  ],
  enableNativeFramesTracking: !isRunningInExpoGo(), // Tracks slow and frozen frames in the application
});

const queryClient = new QueryClient();

function Layout() {
  const [appIsReady, setAppIsReady] = useState(false);

  const { colorScheme } = useTheme();

  type ThemeOptions = 'light' | 'dark' | 'system';

  // console.log('color scheme: ', colorScheme);

  // useEffect(() => {
  //   const loadTheme = async () => {
  //     // await AsyncStorage.removeItem('theme');
  //     const stored = (await AsyncStorage.getItem('theme')) as ThemeOptions;
  //     if (stored) {
  //       setColorScheme(stored);
  //     } else {
  //       // Default to light if nothing or unexpected value is stored
  //       setColorScheme('light');
  //     }
  //   };

  //   loadTheme();
  // }, [colorScheme]);
  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here

        // Artificially delay for two seconds to simulate a slow loading
        // experience. Remove this if you copy and paste the code!
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
        SplashScreen.hide();
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <ActionSheetProvider>
      <CustomThemeProvider>
        {/* <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : CustomDefaultTheme}> */}
        <GestureHandlerRootView>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <Slot />
            </AuthProvider>
          </QueryClientProvider>
        </GestureHandlerRootView>
        {/* </ThemeProvider> */}
      </CustomThemeProvider>
    </ActionSheetProvider>
  );
}

export default Sentry.wrap(Layout);
