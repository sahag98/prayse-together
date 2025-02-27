import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { Redirect, Stack, Tabs, withLayoutContext } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useNotificationObserver } from '~/hooks/useNotificationObserver';
import { useAuth } from '~/providers/auth-provider';
import { useTheme } from '~/providers/theme-provider';
import {
  createNativeBottomTabNavigator,
  NativeBottomTabNavigationOptions,
  NativeBottomTabNavigationEventMap,
} from '@bottom-tabs/react-navigation';
import { Platform } from 'react-native';
import { ParamListBase, TabNavigationState } from '@react-navigation/native';

const BottomTabNavigator = createNativeBottomTabNavigator().Navigator;

const IosTabs = withLayoutContext<
  NativeBottomTabNavigationOptions,
  typeof BottomTabNavigator,
  TabNavigationState<ParamListBase>,
  NativeBottomTabNavigationEventMap
>(BottomTabNavigator);

export default function TabsLayout() {
  const { currentUser } = useAuth();
  const { colorScheme } = useTheme();
  if (currentUser && currentUser.username === null) {
    return <Redirect href={'/setup'} />;
  }
  return (
    <>
      {/* {Platform.OS === 'ios' ? (
        <>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

          <IosTabs screenOptions={{ tabBarActiveTintColor: '#ebc800' }}>
            <IosTabs.Screen
              name="index"
              options={{
                title: 'Home',
                tabBarIcon: () => require('~/assets/home-icon.png'),
              }}
            />
            <IosTabs.Screen
              name="plans"
              options={{
                title: 'plans',
                tabBarIcon: () => require('~/assets/plans-icon.svg'),
              }}
            />
          </IosTabs>
        </>
      ) : ( */}
      <>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Tabs
          screenOptions={{
            // tabBarBackground: () => <BlurView intensity={50}></BlurView>
            headerShown: false,
            tabBarActiveTintColor: '#ebc800',
            tabBarInactiveBackgroundColor: '',
          }}>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarLabelStyle: {
                padding: 3,
              },
              tabBarStyle: {
                backgroundColor: colorScheme === 'dark' ? '#212121' : 'white',
                borderTopColor: colorScheme === 'dark' ? '#787878' : '#d2d2d2',
              },
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={30} />
              ),
            }}
          />
          <Tabs.Screen
            name="bible"
            options={{
              title: 'Bible',
              tabBarLabelStyle: {
                padding: 3,
              },
              tabBarStyle: {
                backgroundColor: colorScheme === 'dark' ? '#212121' : 'white',
                borderTopColor: colorScheme === 'dark' ? '#787878' : '#d2d2d2',
              },
              tabBarIcon: ({ color, focused }) => (
                <FontAwesome6 name="book-bible" color={color} size={30} />
              ),
            }}
          />
          <Tabs.Screen
            name="plans"
            options={{
              title: 'plans',
              tabBarLabelStyle: {
                padding: 3,
              },
              tabBarStyle: {
                backgroundColor: colorScheme === 'dark' ? '#212121' : 'white',
                borderTopColor: colorScheme === 'dark' ? '#787878' : '#d2d2d2',
              },
              tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'book' : 'book-outline'} color={color} size={30} />
              ),
            }}
          />
        </Tabs>
      </>
      {/* )} */}
    </>
  );
}
