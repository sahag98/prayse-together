import { FlatList, Image, Pressable, Text, TextInput, View } from 'react-native';
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
  const { currentUser, getUserGroups, userGroups } = useAuth();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { removeAll, removePlans, studiedPlans } = useUserStore();

  const { data, isFetched, isLoadingError, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: getUserGroups,
  });
  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  // useEffect(() => {
  //   getUserGroups();
  // }, []);
  return (
    <>
      {/* <Stack.Screen options={{ title: 'Home' }} /> */}
      <Container>
        <View className="flex-1 gap-1 px-4">
          {/* Header */}
          <View className="mb-6 flex-row items-center justify-between gap-5">
            <Pressable className="ml-auto mr-1 flex-row items-center justify-center gap-2 rounded-full border border-light-accent p-2  ">
              <Text className="font-semibold text-light-accent">Feedback</Text>
              <AntDesign className="" name="message1" size={25} color="#FF6F61" />
            </Pressable>

            <Pressable
              onPress={() => router.push('/profile')}
              className="size-14 items-center justify-center rounded-full bg-light-secondary">
              {currentUser?.avatar_url ? (
                <Image source={{ uri: currentUser.avatar_url }} />
              ) : (
                <View className="size-8 items-center justify-center rounded-full ">
                  <Text className="text-base font-semibold uppercase">
                    {currentUser?.username?.charAt(0)}
                    {currentUser?.username?.charAt(1)}
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          <Text className="text-3xl font-bold">Hello {currentUser?.username}</Text>
          <Text className="text-lg font-medium">Start by creating a bible study group.</Text>
          {/* Group List */}
          <FlatList
            style={{ marginTop: 10 }}
            contentContainerStyle={{ flexGrow: 1, gap: 15 }}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={{ gap: 15 }}
            data={data!}
            numColumns={2}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={() => (
              <View className=" flex-1 items-center justify-center">
                <Image
                  source={require('../../assets/prayse-together-logo.png')}
                  width={600}
                  height={600}
                  className="size-48 self-center"
                />
                <Text className="font-medium">No groups created yet</Text>
              </View>
            )}
            renderItem={({ item }) => <GroupItem item={item} />}
          />

          {/* Footer */}
          <View className="mb-4 mt-auto flex-row items-center justify-between">
            <Pressable
              onPress={handlePresentModalPress}
              className="size-20 items-center justify-center self-center rounded-full bg-light-primary">
              <Entypo name="plus" size={30} color="black" />
            </Pressable>
            <Pressable
              onPress={() => router.push('/saved')}
              className="items-center justify-center self-center rounded-3xl bg-light-secondary p-4">
              <Text className="text-lg font-bold">Saved Notes</Text>
            </Pressable>
          </View>
        </View>

        <CreateGroupBottomModal
          currentUser={currentUser}
          bottomSheetModalRef={bottomSheetModalRef}
        />
      </Container>
    </>
  );
}
