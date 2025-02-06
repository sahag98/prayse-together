import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  Platform,
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
import { useTheme } from '~/providers/theme-provider';
import { useBottomTabBarHeight } from 'react-native-bottom-tabs';
export default function Home() {
  const { colorScheme } = useTheme();
  const { currentUser, getUserGroups } = useAuth();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { fetchStudies, studies, notes } = useUserStore();
  // const tabBarHeight = Platform.OS === 'ios' ? useBottomTabBarHeight() : null;
  useEffect(() => {
    if (currentUser) {
      fetchStudies(currentUser?.id);
    }
  }, []);

  // const { data, isLoading } = useQuery({
  //   queryKey: ['groups'],
  //   queryFn: getUserGroups,
  // });
  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  return (
    <>
      {/* <Stack.Screen options={{ title: 'Home' }} /> */}
      <Container>
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between gap-5 ">
          <Pressable
            onPress={() => Linking.openURL('https://prayse.canny.io/testing-feedback/create')}
            className="ml-auto mr-1 flex-row items-center justify-center gap-2 rounded-full border border-secondary p-2  sm:p-4">
            <Text className="font-nunito-semibold text-foreground sm:text-lg">Feedback</Text>
            <AntDesign className="text-foreground" name="message1" size={25} color="#87ceeb" />
          </Pressable>

          <Pressable
            onPress={() => router.push('/profile')}
            className="size-14 items-center justify-center rounded-full">
            {currentUser?.avatar_url ? (
              <Image
                className="w-full rounded-full"
                style={{ width: '100%', aspectRatio: 1 / 1 }}
                source={{ uri: currentUser.avatar_url }}
              />
            ) : (
              <View className="size-14 items-center justify-center rounded-full border border-cardborder bg-card sm:size-20 ">
                <Text className="font-nunito-semibold text-lg uppercase text-foreground sm:text-2xl">
                  {currentUser?.username?.charAt(0)}
                  {currentUser?.username?.charAt(1)}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        <Text className="mb-1 font-nunito-bold text-4xl text-foreground">
          Hello {currentUser?.username} 👋
        </Text>
        <Text className="mb-1 mt-3 font-nunito-semibold text-2xl text-foreground sm:text-3xl">
          Bible Studies
        </Text>
        {/* Group List */}
        <FlatList
          contentInsetAdjustmentBehavior="automatic"
          style={{ marginTop: 5 }}
          contentContainerStyle={{ flexGrow: 1, gap: 15 }}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{ gap: 15 }}
          data={studies!}
          // ListFooterComponent={() => <View className="h-32" />}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={() => (
            <View className=" flex-1 items-center justify-center">
              <Image
                source={require('../../../assets/prayse-together-logo.png')}
                width={600}
                height={600}
                style={{ tintColor: colorScheme === 'dark' ? 'white' : 'black' }}
                className="size-48 self-center"
              />
              <Text className="w-3/4 text-center font-nunito-medium font-medium text-foreground">
                No Bible studies yet. Start one and dive into God’s Word!
              </Text>
            </View>
          )}
          renderItem={({ item }) => <GroupItem item={item} />}
          ListFooterComponent={() => <View className="h-32" />}
        />

        {/* Footer */}
        <View
          style={{
            position: 'absolute',
            bottom: 20,
          }}
          className="absolute bottom-0 left-4 w-full flex-row items-center justify-between sm:left-20">
          <Pressable
            onPress={handlePresentModalPress}
            className="size-20 items-center justify-center self-center rounded-full bg-primary">
            <Entypo name="plus" size={30} color="black" />
          </Pressable>
          {notes.length > 0 && (
            <Pressable
              onPress={() => router.push('/saved')}
              className="items-center justify-center self-center rounded-3xl bg-secondary p-4">
              <Text className="font-nunito-bold text-lg">Saved Notes</Text>
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
