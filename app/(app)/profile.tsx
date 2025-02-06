import {
  Alert,
  FlatList,
  Linking,
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
import Feather from '@expo/vector-icons/Feather';
import { Image } from 'expo-image';
import { useTheme } from '~/providers/theme-provider';

const blurhash = 'L1QvwR-;fQ-;~qfQfQfQfQfQfQfQ';

const ProfilePage = () => {
  const { colorScheme } = useTheme();

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
            <AntDesign name="left" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
          </Pressable>
        )}
        <View className="mt-8 flex-row items-center gap-4">
          {currentUser?.avatar_url ? (
            <Image
              style={{ width: 80, aspectRatio: 1 / 1 }}
              className="rounded-full"
              source={{ uri: currentUser.avatar_url }}
              placeholder={{ blurhash }}
              contentFit="cover"
              transition={1000}
            />
          ) : (
            <View className="size-28 items-center justify-center rounded-full border border-cardborder bg-card ">
              <Text className="font-nunito-semibold text-3xl uppercase text-foreground">
                {currentUser?.username?.charAt(0)}
                {currentUser?.username?.charAt(1)}
              </Text>
            </View>
          )}
          <View className="gap-1">
            <Text className="font-nunito-semibold text-2xl text-foreground">
              {currentUser?.username}
            </Text>
            <Text className="font-nunito-medium text-foreground">
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
        <View className="items-center justify-center gap-2 rounded-2xl border border-cardborder bg-card p-4">
          <Text className="font-nunito-bold text-xl text-foreground">Bible Study By Prayse</Text>
          <Text className="font-nunito-medium text-foreground">v.1.0.0</Text>
        </View>
        <View className="justify-center gap-1 rounded-2xl border  border-cardborder bg-card p-4">
          <Text className="text-center font-nunito-semibold text-foreground">App Theme Verse</Text>
          <Text className="text-lg font-semibold text-foreground">2 Timothy 2:15</Text>
          <Text className="font-nunito-medium text-foreground">
            Be diligent to present yourself approved to God, a worker who does not need to be
            ashamed, rightly dividing the word of truth.
          </Text>
        </View>
        <View className="gap-3">
          <Text className="font-nunito-bold text-xl text-foreground">
            Check out our prayer list app:
          </Text>
          <Pressable
            onPress={() => {
              if (Platform.OS === 'ios') {
                Linking.openURL('https://apps.apple.com/us/app/prayse-prayer-journal/id6443480347');
              } else {
                Linking.openURL(
                  'https://play.google.com/store/apps/details?id=com.sahag98.prayerListApp&hl=en_US&gl=US'
                );
              }
            }}
            className="flex-row items-center gap-4 rounded-2xl border border-cardborder bg-card p-4">
            <Image
              style={{ width: 60, aspectRatio: 1 / 1, borderRadius: 10 }}
              className="rounded-full"
              source={require('~/assets/prayse-logo.png')}
              placeholder={{ blurhash }}
              contentFit="cover"
              transition={1000}
            />
            <Text className="font-nunito-bold text-xl text-foreground">Prayse</Text>
            <Feather
              name="external-link"
              size={24}
              className="ml-auto"
              color={colorScheme === 'dark' ? 'white' : 'black'}
            />
          </Pressable>
        </View>
        <View className="mb-20 mt-auto gap-3">
          <Pressable
            onPress={() => {
              supabase.auth.signOut();
              setCurrentUser(null);
              // router.push('/(auth)');
            }}
            className="w-full items-center justify-center rounded-xl bg-red-100 p-4 dark:bg-red-950">
            <Text className="font-nunito-semibold text-base text-red-600 dark:text-foreground">
              Sign out
            </Text>
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
            className=" w-full items-center justify-center rounded-xl bg-card p-4">
            <Text className="font-nunito-semibold text-base text-foreground">Delete account</Text>
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
