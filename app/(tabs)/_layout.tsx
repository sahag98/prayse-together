import { Ionicons } from '@expo/vector-icons';
import { Stack, Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#1f7ea4' }}>
      <Tabs.Screen
        name="home"
        options={{
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
