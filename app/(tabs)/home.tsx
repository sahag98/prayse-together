import { Image, Pressable, Text, View } from 'react-native';
import { Container } from '~/components/Container';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '~/utils/supabase';
import { useAuth } from '~/providers/auth-provider';
import { Redirect } from 'expo-router';
export default function Home() {
  const { currentUser } = useAuth();

  return (
    <>
      {/* <Stack.Screen options={{ title: 'Home' }} /> */}
      <Container>
        <View className="flex-1 gap-5 px-4">
          <Text className="text-2xl font-bold">Hello {currentUser?.username}</Text>
        </View>
      </Container>
    </>
  );
}
