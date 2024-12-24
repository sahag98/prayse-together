import { FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  const { currentUser } = useAuth();
  const { studiedPlans } = useUserStore();
  const badges = [
    {
      image: lessonCompletion,
      title: '3 completed lessons',
      achieved: studiedPlans.length === 3,
    },
    { image: planCompletion, title: 'Plan Completion', achieved: false }, // Example: achieved
    { image: studyCompletion, title: 'Study Completion', achieved: false }, // Example: not yet achieved
  ];

  return (
    <Container>
      <View className="flex-1 bg-light-background px-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <Pressable
              onPress={() => {
                router.push('/(tabs)/home');
              }}>
              <AntDesign name="left" size={24} color="black" />
            </Pressable>
            <Text className="text-2xl font-bold">Profile</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={{ flex: 1 }} className="">
          <View className="mt-8 items-center gap-4">
            {currentUser?.avatar_url ? (
              <Image source={{ uri: currentUser.avatar_url }} />
            ) : (
              <View className="size-32 items-center justify-center rounded-full bg-light-secondary ">
                <Text className="text-3xl font-semibold uppercase">
                  {currentUser?.username?.charAt(0)}
                  {currentUser?.username?.charAt(1)}
                </Text>
              </View>
            )}
            <Text className="text-xl font-semibold">{currentUser?.username}</Text>
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
        </ScrollView>
        <Pressable
          onPress={() => supabase.auth.signOut()}
          className="mb-5 mt-auto w-full items-center justify-center rounded-xl bg-light-accent p-4">
          <Text className="text-base font-semibold text-white">Sign out</Text>
        </Pressable>
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
