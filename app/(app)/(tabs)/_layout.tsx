import { Ionicons } from '@expo/vector-icons';
import { Redirect, Stack, Tabs } from 'expo-router';
import { useNotificationObserver } from '~/hooks/useNotificationObserver';
import { useAuth } from '~/providers/auth-provider';

export default function TabsLayout() {
  const { currentUser } = useAuth();

  if (currentUser && currentUser.username === null) {
    return <Redirect href={'/setup'} />;
  }
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#1f7ea4' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={30} />
          ),
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          title: 'plans',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'book' : 'book-outline'} color={color} size={30} />
          ),
        }}
      />
    </Tabs>
  );
}
