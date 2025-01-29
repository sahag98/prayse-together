import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Container } from '~/components/Container';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '~/utils/supabase';
import { useAuth } from '~/providers/auth-provider';
import { Link, Redirect, router } from 'expo-router';
import { Entypo, Feather } from '@expo/vector-icons';
import { useCallback, useEffect, useRef } from 'react';
import GroupItem from '~/components/GroupItem';
import CreateBottomModal from '~/modals/create-group';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import CreateGroupBottomModal from '~/modals/create';
import { useUserStore } from '~/store/store';
import { useQuery } from '@tanstack/react-query';
export default function Home() {
  const { currentUser, getUserGroups } = useAuth();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { notes } = useUserStore();

  const { data, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: getUserGroups,
  });
  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  return (
    <>
      {/* <Stack.Screen options={{ title: 'Home' }} /> */}
      <Container>
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between gap-5">
          <Pressable
            onPress={() => Linking.openURL('https://prayse.canny.io/testing-feedback/create')}
            className="ml-auto mr-1 flex-row items-center justify-center gap-2 rounded-full border border-secondary p-2  ">
            <Text className="font-semibold text-foreground">Feedback</Text>
            <AntDesign className="text-foreground" name="message1" size={25} color="#87ceeb" />
          </Pressable>

          <Pressable
            onPress={() => router.push('/profile')}
            className="bg-light-secondary size-14 items-center justify-center rounded-full">
            {currentUser?.avatar_url ? (
              <Image
                className="rounded-full"
                style={{ width: '100%', aspectRatio: 1 / 1 }}
                source={{ uri: currentUser.avatar_url }}
              />
            ) : (
              <View className="size-8 items-center justify-center rounded-full ">
                <Text className="text-lg font-semibold uppercase">
                  {currentUser?.username?.charAt(0)}
                  {currentUser?.username?.charAt(1)}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        <Text className="mb-1 text-4xl font-bold text-foreground">
          Hello {currentUser?.username} 👋
        </Text>
        <Text className="mb-1 mt-3 text-2xl font-semibold text-foreground">Bible Studies</Text>
        {/* Group List */}
        <FlatList
          contentInsetAdjustmentBehavior="automatic"
          style={{ marginTop: 5 }}
          contentContainerStyle={{ flexGrow: 1, gap: 15 }}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{ gap: 15 }}
          data={data!}
          ListFooterComponent={() => <View className="h-32" />}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={() => (
            <View className=" flex-1 items-center justify-center">
              <Image
                source={require('../../../assets/prayse-together-logo.png')}
                width={600}
                height={600}
                className="size-48 self-center"
              />
              <Text className="font-medium text-foreground">No groups created yet</Text>
            </View>
          )}
          renderItem={({ item }) => <GroupItem item={item} />}
        />

        {/* Footer */}
        <View className="absolute bottom-16 left-4 flex-row items-center justify-between pb-16">
          <Pressable
            onPress={handlePresentModalPress}
            className="size-20 items-center justify-center self-center rounded-full bg-primary">
            <Entypo name="plus" size={30} color="black" />
          </Pressable>
          {notes.length > 0 && (
            <Pressable
              onPress={() => router.push('/saved')}
              className="items-center justify-center self-center rounded-3xl bg-secondary p-4">
              <Text className="text-lg font-bold">Saved Notes</Text>
            </Pressable>
          )}
        </View>

        <CreateGroupBottomModal
          currentUser={currentUser}
          bottomSheetModalRef={bottomSheetModalRef}
        />
      </Container>
    </>
  );
}
