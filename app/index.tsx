import { Stack, Link } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';

import { Button } from '~/components/Button';
import { Container } from '~/components/Container';
import { ScreenContent } from '~/components/ScreenContent';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function Home() {
  return (
    <>
      {/* <Stack.Screen options={{ title: 'Home' }} /> */}
      <Container>
        <View className="flex-1 justify-center gap-5 px-4">
          <View className="gap-2">
            <Image
              source={require('../assets/prayse-together-logo.png')}
              width={600}
              height={600}
              className="size-72 self-center"
            />
            <Text className="text-4xl font-bold">Welcome to Prayse Together</Text>
            <Text className="">
              Your guide to exploring the Bible and growing in faith with others.
            </Text>
          </View>
          <View className="mt-5 gap-3">
            <Pressable className="bg-light-primary flex-row items-center justify-center gap-2 rounded-lg p-4">
              <AntDesign name="google" size={24} color="black" />
              <Text className="font-semibold">Continue with Google</Text>
            </Pressable>
            <Pressable className="bg-light-primary flex-row items-center justify-center gap-2 rounded-lg p-4">
              <AntDesign name="apple-o" size={24} color="black" />
              <Text className="font-semibold">Continue with Apple</Text>
            </Pressable>
          </View>
        </View>
      </Container>
    </>
  );
}
