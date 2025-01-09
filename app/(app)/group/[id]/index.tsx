import { Pressable, Text, View, TextInput, FlatList, Alert, Image, Animated } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Redirect, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Container } from '~/components/Container';
import { supabase } from '~/utils/supabase';
import { Tables } from '~/database.types';

import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '~/providers/auth-provider';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import JoinGroupModal from '~/modals/join-group';

import GetVerseModal from '~/modals/get-verse-modal';
import { Note, Profile } from '~/types/types';
import NoteItem from '~/components/NoteItem';
import InsertTextModlal from '~/modals/insert-text-modal';

const GroupPage = () => {
  const { id } = useLocalSearchParams();
  const inputRef = useRef<TextInput>(null);
  const joinModalRef = useRef<BottomSheetModal>(null);
  const [showVerseModal, setShowVerseModal] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { currentUser } = useAuth();
  const [channel, setChannel] = useState();
  const [currentGroup, setCurrentGroup] = useState<Tables<'study_group'> | null>();
  const [groupNotes, setGroupNotes] = useState<Note[] | null>();
  const [showDropdown, setShowDropdown] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  // async function updateNote() {
  //   if (note === initialNote) return; // No changes to save

  //   const { data: existingNote, error: fetchError } = await supabase
  //     .from('group_notes')
  //     .select('*')
  //     .eq('group_id', id)
  //     .single();

  //   if (fetchError && fetchError.code !== 'PGRST116') {
  //     console.error('Error fetching existing note:', fetchError);
  //     return;
  //   }

  //   if (existingNote) {
  //     const { error: updateError } = await supabase
  //       .from('group_notes')
  //       .update({ note })
  //       .eq('group_id', id);

  //     if (updateError) {
  //       console.error('Error updating note:', updateError);
  //       return;
  //     }
  //   } else {
  //     const { data: noteData, error: insertError } = await supabase
  //       .from('group_notes')
  //       .insert({ group_id: Number(id), note })
  //       .select()
  //       .single();

  //     if (insertError) {
  //       console.error('Error inserting note:', insertError);
  //       return;
  //     }

  //     const { error } = await supabase
  //       .from('study_group')
  //       .update({ note_id: noteData.id })
  //       .eq('id', id);

  //     console.log('update group note error: ', error);

  //     if (insertError) {
  //       console.error('Error inserting note:', insertError);
  //       return;
  //     }
  //   }

  //   setInitialNote(note);
  // }

  // // Call the function
  // getBibleVerse();

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
        //  channel.on('broadcast', { event: 'message' }, ({ payload }) => {
        //    setGroupMessages((messages) => [payload, ...messages]);
        //  });

        channel.on('presence', { event: 'sync' }, () => {
          /** Get the presence state from the channel, keyed by realtime identifier */
          const presenceState = channel.presenceState();

          /** transform the presence */
          const users = Object.keys(presenceState)
            .map((presenceId) => {
              const presences = presenceState[presenceId];
              return presences.map((presence) => presence.currentUser);
            })
            .flat();

          setOnlineUsers(users);
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

  useEffect(() => {
    getGroup();
    getGroupNote();

    // Set up real-time subscription
    const channel = supabase
      .channel('group')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'group_notes', filter: `group_id=eq.${id}` },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            console.log('should UPDATE: ', payload.new);

            const newNote = payload.new;

            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', newNote.user_id)
              .single();

            console.log('new note: ', newNote);

            const noteWithProfile = {
              ...newNote,
              profiles: {
                avatar_url: profile?.avatar_url,
                username: profile?.username,
              },
            };
            //@ts-expect-error
            setGroupNotes((prev) => [...prev, noteWithProfile]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'study_group', filter: `id=eq.${id}` },
        (payload) => {
          console.log('new!!');
          if (payload.eventType === 'UPDATE') {
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
  }, [id]);

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
                <AntDesign name="left" size={24} color="black" />
              </Pressable>
              <Text className="text-3xl font-bold">{currentGroup?.name}</Text>
            </View>
          </View>
          <View className="flex-1 items-center justify-center gap-2">
            <MaterialCommunityIcons
              className="animate-spin"
              name="loading"
              size={70}
              color="#FFD700"
            />
            <Text className="w-4/5  text-center font-medium">
              Please wait for the admin to start the study.
            </Text>
          </View>
        </View>
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
                router.back();
              }}>
              <AntDesign name="left" size={24} color="black" />
            </Pressable>
            <Text className="text-3xl font-bold">{currentGroup?.name}</Text>
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
          <Pressable
            onPress={() => setShowDropdown((prev) => !prev)}
            className="absolute top-5 z-10 w-full">
            <View className="flex-row items-center justify-between rounded-xl bg-gray-200 p-3">
              <Text className="font-medium">
                {onlineUsers.length} {onlineUsers.length === 1 ? 'person' : 'people'} in study
              </Text>
              <AntDesign name={showDropdown ? 'up' : 'down'} size={20} color="black" />
            </View>

            {showDropdown && (
              <View className="mt-2 rounded-xl bg-gray-200 p-2">
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

          <FlatList
            data={groupNotes?.toReversed()}
            inverted
            style={{ marginBottom: 5, flex: 1, marginTop: 15 }}
            contentContainerStyle={{ gap: 15 }}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item?.id?.toString()}
            renderItem={({ item }) => <NoteItem item={item} />}
          />
          {currentGroup.has_started && (
            <View className="mb-8 mt-auto flex-row justify-between gap-4 pt-2">
              <Pressable
                onPress={() => setShowVerseModal(true)}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-light-primary bg-light-primary/15 p-3">
                <Text className="text-lg font-medium">Bible Verse</Text>
                <AntDesign name="plus" size={15} color="black" />
              </Pressable>
              <Pressable
                onPress={() => setShowTextModal(true)}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-light-secondary bg-light-secondary/15 p-3">
                <Text className="text-lg font-medium">Text</Text>
                <AntDesign name="plus" size={15} color="black" />
              </Pressable>
            </View>
          )}
        </View>
      </View>

      <JoinGroupModal code={currentGroup?.code} bottomSheetModalRef={joinModalRef} />
      <GetVerseModal groupId={id} visible={showVerseModal} setVisible={setShowVerseModal} />
      <InsertTextModlal groupId={id} visible={showTextModal} setVisible={setShowTextModal} />
    </Container>
  );
};

export default GroupPage;
