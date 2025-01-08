import {
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React from 'react';
import { Container } from '~/components/Container';
import { router } from 'expo-router';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '~/providers/auth-provider';

import planCompletion from '~/assets/plan-completion.png';
import studyCompletion from '~/assets/study-completion.png';
import lessonCompletion from '~/assets/lesson-completion.png';
import { supabase } from '~/utils/supabase';
import { useUserStore } from '~/store/store';

const ProfilePage = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const { studiedPlans } = useUserStore();

  // console.log('current user: ', currentUser);
  const badges = [
    {
      image: lessonCompletion,
      title: '3 completed lessons',
      achieved: studiedPlans.length === 3,
    },
    { image: planCompletion, title: 'Plan Completion', achieved: false }, // Example: achieved
    { image: studyCompletion, title: 'Study Completion', achieved: false }, // Example: not yet achieved
  ];

  async function deleteAccount() {
    await supabase.auth.signOut();
    setCurrentUser(null);
    const { data } = await supabase.functions.invoke('delete-account', {
      body: JSON.stringify({
        userId: currentUser?.id,
      }),
    });
  }

  return (
    <Container>
      <View className="h-full flex-1 gap-5">
        {Platform.OS === 'android' && (
          <Pressable
            onPress={() => {
              router.back();
            }}>
            <AntDesign name="left" size={24} color="black" />
          </Pressable>
        )}
        <View className="mt-8 flex-row items-center gap-4">
          {currentUser?.avatar_url ? (
            <Image
              style={{ width: 80, aspectRatio: 1 / 1 }}
              className="rounded-full"
              source={{ uri: currentUser.avatar_url }}
            />
          ) : (
            <View className="size-28 items-center justify-center rounded-full bg-light-secondary ">
              <Text className="text-3xl font-semibold uppercase">
                {currentUser?.username?.charAt(0)}
                {currentUser?.username?.charAt(1)}
              </Text>
            </View>
          )}
          <View className="gap-1">
            <Text className="text-2xl font-semibold">{currentUser?.username}</Text>
            <Text className=" font-medium">
              Joined: {currentUser && new Date(currentUser.created_at).toDateString()}
            </Text>
          </View>

          {/* <View className="mt-4 w-full gap-3">
              <View className="flex-row items-center gap-3 self-start">
                <Text className="text-xl font-medium">Achievements</Text>
                <MaterialCommunityIcons name="medal-outline" size={30} color="black" />
              </View>
              <View className="flex-row gap-3">
                {badges.map((badge, index) => (
                  <View
                    className="aspect-square flex-1 items-center justify-center gap-2"
                    key={index}>
                    <Image
                      source={badge.image}
                      style={[
                        styles.badgeImage,
                        !badge.achieved && styles.badgeNotAchieved, // Apply gray style if not achieved
                      ]}
                    />
                    <Text className="text-sm font-medium">{badge.title}</Text>
                  </View>
                ))}
              </View>
            </View> */}
        </View>
        <View className="items-center justify-center gap-2 rounded-2xl bg-light-secondary/50 p-4">
          <Text className="text-xl font-bold">Bible Study By Prayse</Text>
          <Text className="">v.1.0.0</Text>
        </View>
        <View className="items-center justify-center gap-2 rounded-2xl bg-gray-200 p-4">
          <Text className="text-lg font-semibold">2 Timothy 2:15</Text>
          <Text>
            Be diligent to present yourself approved to God, a worker who does not need to be
            ashamed, rightly dividing the word of truth.
          </Text>
        </View>
        <View className="mt-5 gap-3">
          <Pressable
            onPress={() => {
              supabase.auth.signOut();
              setCurrentUser(null);
              // router.push('/(auth)');
            }}
            className="  w-full items-center justify-center rounded-xl bg-light-accent p-4">
            <Text className="text-base font-semibold text-white">Sign out</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              Alert.alert('Delete Account', 'This action will permenantly delete your account.', [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                { text: 'Delete', style: 'destructive', onPress: deleteAccount },
              ])
            }
            className=" w-full items-center justify-center rounded-xl bg-gray-400 p-4">
            <Text className="text-base font-semibold text-white">Delete account</Text>
          </Pressable>
        </View>
      </View>
    </Container>
  );
};

export default ProfilePage;

const styles = StyleSheet.create({
  badgeImage: {
    flex: 1,
    resizeMode: 'contain', // Use 'resizeMode' instead of 'objectFit'
  },
  badgeNotAchieved: {
    opacity: 0.3, // Dim the image to indicate it's not achieved
    // Alternatively, you can apply a tintColor to simulate grayscale
    // tintColor: 'gray',
  },
});
