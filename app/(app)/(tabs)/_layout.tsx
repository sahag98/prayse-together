import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';

import { useAuth } from '~/providers/auth-provider';
import { useTheme } from '~/providers/theme-provider';
import { StatusBar } from 'expo-status-bar';

import { withLayoutContext } from 'expo-router';
import { createNativeBottomTabNavigator } from '@bottom-tabs/react-navigation';
import homeIcon from '../../../assets/home-icon.png';

export const Tabs = withLayoutContext(createNativeBottomTabNavigator().Navigator);

export default function TabsLayout() {
  const { currentUser } = useAuth();

  const { colorScheme } = useTheme();

  if (currentUser && currentUser.username === null) {
    return <Redirect href={'/setup'} />;
  }
  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      <Tabs screenOptions={{ tabBarActiveTintColor: '#ebc800' }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarStyle: {
              backgroundColor: colorScheme === 'dark' ? '#212121' : 'white',
              borderTopColor: colorScheme === 'dark' ? '#787878' : '#d2d2d2',
            },
            tabBarIcon: () => require('~/assets/home-icon.png'),
          }}
        />
        <Tabs.Screen
          name="plans"
          options={{
            title: 'plans',
            tabBarStyle: {
              backgroundColor: colorScheme === 'dark' ? '#212121' : 'white',
              borderTopColor: colorScheme === 'dark' ? '#787878' : '#d2d2d2',
            },
            tabBarIcon: () => require('~/assets/plans-icon.svg'),
          }}
        />
      </Tabs>
    </>
  );
}
