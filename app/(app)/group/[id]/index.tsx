import { Pressable, Text, View, TextInput, FlatList, Alert, Image, Animated } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Redirect, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Container } from '~/components/Container';
import { supabase } from '~/utils/supabase';
import { Tables } from '~/database.types';

import { AntDesign, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '~/providers/auth-provider';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import JoinGroupModal from '~/modals/join-group';

import GetVerseModal from '~/modals/get-verse-modal';
import { GroupMembers, Note, Profile } from '~/types/types';
import NoteItem from '~/components/NoteItem';
import GroupSettingsModal from '~/modals/group-settings';
import { RealtimeChannel } from '@supabase/supabase-js';
import InsertTextModal from '~/modals/insert-text-modal';
import { useTheme } from '~/providers/theme-provider';

const GroupPage = () => {
  const { colorScheme } = useTheme();

  const { id } = useLocalSearchParams();
  const inputRef = useRef<TextInput>(null);
  const joinModalRef = useRef<BottomSheetModal>(null);
  const [showVerseModal, setShowVerseModal] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [lessonTitle, setLessonTitle] = useState('');
  const { currentUser } = useAuth();
  const [channel, setChannel] = useState<RealtimeChannel | undefined>();
  const [currentGroup, setCurrentGroup] = useState<Tables<'study_group'> | null>();
  const [groupMembers, setGroupMembers] = useState<GroupMembers[] | null>();
  const [groupNotes, setGroupNotes] = useState<Note[] | null>();
  const [showDropdown, setShowDropdown] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const groupSettingsModalRef = useRef<BottomSheetModal>(null);
  // callbacks
  const handlePresentJoinModalPress = useCallback(() => {
    joinModalRef.current?.present();
  }, []);

  async function getGroup() {
    const { data: study_group, error } = await supabase
      .from('study_group')
      .select('*')
      .eq('id', id);

    if (study_group) {
      setCurrentGroup(study_group[0]);
    }
  }

  async function getGroupNote() {
    const { data, error } = await supabase
      .from('group_notes')
      .select('*, profiles(username,avatar_url)')
      .eq('group_id', id);
    //@ts-expect-error
    setGroupNotes(data);
  }

  async function endBibleStudy() {
    const { data, error } = await supabase
      .from('study_group')
      .update({ has_started: false })
      .eq('id', id)
      .select();
  }

  async function addTitleToStudy() {
    if (lessonTitle) {
      const { data, error } = await supabase
        .from('study_group')
        .update({ lesson_title: lessonTitle })
        .eq('id', id)
        .select();
    }
  }

  useFocusEffect(
    // Callback should be wrapped in `React.useCallback` to avoid running the effect too often.
    useCallback(() => {
      // Invoked whenever the route is focused.

      if (id && currentUser?.id) {
        // dispatch(clearMessages());

        //  getGroupMessages();

        /**
         * Step 1:
         *
         * Create the supabase channel for the roomCode, configured
         * so the channel receives its own messages
         */
        const channel = supabase.channel(`room:${id}`, {
          config: {
            broadcast: {
              self: true,
            },
            presence: {
              key: currentUser?.id,
            },
          },
        });

        /**
         * Step 2:
         *
         * Listen to broadcast messages with a `message` event
         */
        channel.on('broadcast', { event: 'message' }, ({ payload }) => {
          console.log('broadcast payload: ', payload);
          //@ts-expect-error
          setGroupNotes((prev) => [...prev, payload]);
        });

        channel.on('presence', { event: 'sync' }, () => {
          /** Get the presence state from the channel, keyed by realtime identifier */
          const presenceState = channel.presenceState();

          /** transform the presence */
          const users = Object.keys(presenceState)
            .map((presenceId) => {
              const presences = presenceState[presenceId];
              return presences.map((presence: any) => presence.currentUser);
            })
            .flat();

          setOnlineUsers(users as any);
        });

        /**
         * Step 3:
         *
         * Subscribe to the channel
         */
        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            channel.track({ currentUser });
          }
        });

        /**
         * Step 4:
         *
         * Set the channel in the state
         */

        setChannel(channel);

        /**
         * * Step 5:
         *
         * Return a clean-up function that unsubscribes from the channel
         * and clears the channel state
         */
        return () => {
          channel.unsubscribe();
          setChannel(undefined);
        };
      }
      // Return function is invoked whenever the route gets out of focus.
    }, [id, currentUser?.id])
  );

  async function getGroupMembers() {
    const { data: group_members, error } = await supabase
      .from('group_members')
      .select('*, profiles(*)')
      .eq('group_id', id);
    // .neq('user_id', currentUser?.id);

    if (group_members) {
      //@ts-expect-error
      setGroupMembers(group_members);
    }
  }

  useEffect(() => {
    getGroup();
    getGroupNote();
    getGroupMembers();
    const channel = supabase
      .channel('group')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'study_group', filter: `id=eq.${id}` },
        (payload) => {
          console.log('new!!');
          if (payload.eventType === 'UPDATE') {
            if (payload.new.study_title) {
              console.log('NEW TITLE!!!');
            }
            if (payload.new.has_started === true) {
              console.log('STUDY IS STARTING: ', payload.new);
              // router.push(`/group/${id}`);
              setCurrentGroup((prev: any) => ({
                ...prev,
                has_started: true,
              }));
            } else if (!payload.new.has_started) {
              console.log('STUDY IS ENDING: ', payload.new);
              setCurrentGroup((prev: any) => ({
                ...prev,
                has_started: false,
              }));
              router.push(`/group/${id}/end`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel); // Clean up the subscription
    };
    // Set up real-time subscription
  }, [id]);

  const handlePresentGroupSettingsModalPress = useCallback(() => {
    groupSettingsModalRef.current?.present();
  }, []);

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // After 4 seconds, fade out
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (!currentGroup) return;

  if (!currentGroup.has_started && currentGroup.admin_id === currentUser?.id) {
    return <Redirect href={`/group/${id}/start`} />;
  }

  if (!currentGroup.has_started) {
    return (
      <Container>
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={() => {
                  router.push('/(app)/(tabs)');
                }}>
                <AntDesign
                  name="left"
                  size={24}
                  color={colorScheme === 'dark' ? 'white' : 'black'}
                />
              </Pressable>
              <Text className="text-foreground text-3xl font-bold">{currentGroup?.name}</Text>
            </View>
            <Pressable onPress={handlePresentGroupSettingsModalPress} className="">
              <Entypo
                name="dots-three-vertical"
                size={24}
                color={colorScheme === 'dark' ? 'white' : 'black'}
              />
            </Pressable>
          </View>
          <View className="flex-1 items-center justify-center gap-2">
            <MaterialCommunityIcons
              className="animate-spin"
              name="loading"
              size={70}
              color="#FFD700"
            />
            <Text className="text-foreground w-4/5 text-center font-medium">
              Please wait for the admin to start the study.
            </Text>
          </View>
        </View>
        {groupMembers && (
          <GroupSettingsModal
            group_id={currentGroup?.id}
            created={currentGroup?.created_at!}
            admin={groupMembers[0]}
            code={currentGroup?.code!}
            bottomSheetModalRef={groupSettingsModalRef}
          />
        )}
      </Container>
    );
  }

  return (
    <Container>
      <View className="flex-1">
        <View className="flex-row items-center justify-between gap-4">
          <View className="flex-1 flex-row items-center gap-2">
            <Pressable
              onPress={() => {
                if (currentGroup.has_started) {
                  router.push('/(app)/(tabs)');
                } else {
                  router.back();
                }
              }}>
              <AntDesign name="left" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
            </Pressable>
            <Text className="text-foreground text-3xl font-bold">{currentGroup?.name}</Text>
          </View>
          {currentGroup.has_started && currentUser?.id === currentGroup.admin_id && (
            <>
              <Pressable onPress={handlePresentJoinModalPress} className="p-2">
                <AntDesign name="addusergroup" size={30} color="black" />
              </Pressable>
              <Pressable
                onPress={() =>
                  Alert.alert(
                    'End Bible Study',
                    'This action will end the current study for everyone.',
                    [
                      {
                        text: 'Cancel',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                      },
                      { text: 'End', style: 'destructive', onPress: endBibleStudy },
                    ]
                  )
                }
                className="rounded-xl border border-red-400 bg-red-100 px-4 py-2">
                <Text className="text-lg font-bold text-red-500">END</Text>
              </Pressable>
            </>
          )}
        </View>
        <View className="flex-1">
          <View className="relative h-20 ">
            <Pressable
              onPress={() => setShowDropdown((prev) => !prev)}
              className="absolute top-5 z-10 w-full">
              <View className="bg-card border-cardborder flex-row items-center justify-between rounded-xl border p-3">
                <Text className="text-foreground font-medium">
                  {onlineUsers.length} {onlineUsers.length === 1 ? 'person' : 'people'} in study
                </Text>
                <AntDesign
                  name={showDropdown ? 'up' : 'down'}
                  size={20}
                  color={colorScheme === 'dark' ? 'white' : 'black'}
                />
              </View>

              {showDropdown && (
                <View className="bg-card border-cardborder mt-2 rounded-xl border p-2">
                  {onlineUsers.map((user: Profile) => (
                    <View className="flex-row items-center gap-3 p-2" key={user.id}>
                      {user?.avatar_url ? (
                        <Image
                          style={{ width: 30, aspectRatio: 1 / 1 }}
                          className="rounded-full"
                          source={{ uri: user.avatar_url }}
                        />
                      ) : (
                        <View className="size-9 items-center justify-center rounded-full bg-gray-300">
                          <Text className="text-base font-medium uppercase">
                            {user.username.charAt(0)}
                            {user.username.charAt(1)}
                          </Text>
                        </View>
                      )}
                      <Text className="text-sm">{user.username}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Pressable>

            <Animated.View
              style={{
                opacity: fadeAnim,
                position: 'absolute',
                top: 20,
                width: '100%',
                zIndex: 20,
                display: showDropdown ? 'none' : 'flex',
              }}>
              {onlineUsers.map((user: Profile) => (
                <View
                  className="mb-2 flex-row items-center gap-3 rounded-xl bg-gray-200 p-2"
                  key={user.id}>
                  {user?.avatar_url ? (
                    <Image
                      style={{ width: 30, aspectRatio: 1 / 1 }}
                      className="rounded-full"
                      source={{ uri: user.avatar_url }}
                    />
                  ) : (
                    <View className="size-9 items-center justify-center rounded-full bg-gray-300">
                      <Text className="text-base font-medium uppercase">
                        {user.username.charAt(0)}
                        {user.username.charAt(1)}
                      </Text>
                    </View>
                  )}
                  <Text className="text-sm">{user.username} is in the study.</Text>
                </View>
              ))}
            </Animated.View>
          </View>
          <Text className="mt-5 text-center text-lg font-bold">Today's study title</Text>
          <FlatList
            data={groupNotes?.toReversed()}
            inverted={groupNotes && groupNotes?.length > 0}
            style={{ marginBottom: 5, flex: 1, marginTop: 20 }}
            contentContainerStyle={{ gap: 15, flex: 1 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <>
                {currentGroup.lesson_title ? (
                  <View className="mb-20 w-3/4 flex-1 items-center justify-center gap-3 self-center">
                    <Text className="text-center text-lg font-medium leading-6">
                      You're all set to start!
                    </Text>
                  </View>
                ) : (
                  <View className="mb-20 flex-1 items-center justify-center gap-3 self-center">
                    <Text className="text-center text-lg font-medium leading-6">
                      Start by setting a title for today's study
                    </Text>
                    <View className="mb-2 w-full flex-row items-center justify-between gap-3">
                      <TextInput
                        value={lessonTitle}
                        onChangeText={setLessonTitle}
                        placeholder="What's the title?"
                        className="placeholder:text-light-foreground/70 w-full flex-1 rounded-xl bg-gray-200 p-4"
                      />
                      <Pressable
                        onPress={addTitleToStudy}
                        className="bg-light-primary size-14 items-center justify-center rounded-full">
                        <AntDesign name="plus" size={20} color="black" />
                      </Pressable>
                    </View>
                    <Pressable>
                      <Text>Skip</Text>
                    </Pressable>
                  </View>
                )}
              </>
            )}
            keyExtractor={(item) => item?.id?.toString()}
            renderItem={({ item }) => <NoteItem item={item} />}
          />
          {currentGroup.has_started && currentGroup.lesson_title && (
            <View className="mb-8 mt-auto flex-row justify-between gap-4 pt-2">
              <Pressable
                onPress={() => setShowVerseModal(true)}
                className="border-light-primary bg-light-primary/15 flex-1 flex-row items-center justify-center gap-2 rounded-2xl border p-3">
                <Text className="text-lg font-medium">Bible Verse</Text>
                <AntDesign name="plus" size={15} color="black" />
              </Pressable>
              <Pressable
                onPress={() => setShowTextModal(true)}
                className="border-light-secondary bg-light-secondary/15 flex-1 flex-row items-center justify-center gap-2 rounded-2xl border p-3">
                <Text className="text-lg font-medium">Text</Text>
                <AntDesign name="plus" size={15} color="black" />
              </Pressable>
            </View>
          )}
        </View>
      </View>

      <JoinGroupModal code={currentGroup?.code} bottomSheetModalRef={joinModalRef} />
      <GetVerseModal
        channel={channel}
        groupId={id}
        visible={showVerseModal}
        setVisible={setShowVerseModal}
      />
      <InsertTextModal
        channel={channel}
        groupId={id}
        visible={showTextModal}
        setVisible={setShowTextModal}
      />
    </Container>
  );
};

export default GroupPage;
