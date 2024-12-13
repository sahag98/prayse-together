import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { Container } from '~/components/Container';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '~/utils/supabase';
import { useAuth } from '~/providers/auth-provider';
import { Redirect, router } from 'expo-router';
import { Entypo, Feather } from '@expo/vector-icons';
import { useCallback, useEffect, useRef } from 'react';
import GroupItem from '~/components/GroupItem';
import CreateBottomModal from '~/modals/create-group';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import CreateGroupBottomModal from '~/modals/create';
export default function Home() {
  const { currentUser, getUserGroups, userGroups } = useAuth();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  useEffect(() => {
    getUserGroups();
  }, []);
  return (
    <>
      {/* <Stack.Screen options={{ title: 'Home' }} /> */}
      <Container>
        <View className="flex-1 gap-1 px-4">
          {/* Header */}
          <View className="mb-6 flex-row items-center justify-between">
            <Pressable className="ml-auto mr-1 size-14 items-center justify-center rounded-full  ">
              <AntDesign className="" name="message1" size={25} color="#FF6F61" />
            </Pressable>
            <Pressable className="size-14 items-center justify-center rounded-full bg-light-secondary">
              {currentUser?.avatar_url ? (
                <Image source={{ uri: currentUser.avatar_url }} />
              ) : (
                <Feather
                  onPress={async () => {
                    await supabase.auth.signOut();
                    router.push('/login');
                  }}
                  name="user"
                  size={25}
                  color="black"
                />
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
            data={userGroups}
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
          <Pressable
            onPress={handlePresentModalPress}
            className="mt-auto size-20 items-center justify-center self-center rounded-full bg-light-primary">
            <Entypo name="plus" size={30} color="black" />
          </Pressable>
        </View>
        <CreateGroupBottomModal
          currentUser={currentUser}
          bottomSheetModalRef={bottomSheetModalRef}
        />
      </Container>
    </>
  );
}
