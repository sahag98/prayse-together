import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Container } from '~/components/Container';
import { useAuth } from '~/providers/auth-provider';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '~/utils/supabase';
import { Tables } from '~/database.types';
import {
  AntDesign,
  Entypo,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import JoinGroupModal from '~/modals/join-group';
import { GroupMembers } from '~/types/types';
import axios from 'axios';
import GroupSettingsModal from '~/modals/group-settings';
import { useTheme } from '~/providers/theme-provider';
const StartStudy = () => {
  const { colorScheme } = useTheme();

  const { currentUser } = useAuth();
  const { id } = useLocalSearchParams();
  const [currentGroup, setCurrentGroup] = useState<Tables<'study_group'> | null>();
  const [groupMembers, setGroupMembers] = useState<GroupMembers[] | null>();
  const joinModalRef = useRef<BottomSheetModal>(null);
  const groupSettingsModalRef = useRef<BottomSheetModal>(null);
  useEffect(() => {
    getGroup();
    getGroupMembers();

    const channel = supabase
      .channel('group')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'group_members', filter: `group_id=eq.${id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // console.log('NEW JOINED USER: ', payload.new);
            getGroupMembers();
            const newMember = payload.new;

            const memberWithProfile = {
              ...newMember,
              profiles: {
                avatar_url: currentUser?.avatar_url,
                username: currentUser?.username,
              },
            };
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
            } else if (!payload.new.has_started) {
              console.log('STUDY IS ENDING: ', payload.new);
              router.push(`/group/${id}/start`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel); // Clean up the subscription
    };
  }, [id]);

  const handlePresentJoinModalPress = useCallback(() => {
    joinModalRef.current?.present();
  }, []);
  const handlePresentGroupSettingsModalPress = useCallback(() => {
    groupSettingsModalRef.current?.present();
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

  const studyTime = new Date(currentGroup?.study_time!).toLocaleDateString([], {
    hour: 'numeric',
  });
  const currentTime = new Date().toLocaleDateString([], {
    hour: 'numeric',
  });

  async function startStudy() {
    // SAVING THIS FOR THE FIRST APP UPDATE
    // if (studyTime !== currentTime) {
    //   Alert.alert('Start Study', 'You need to be within the hour of the set study time.', [
    //     {
    //       text: 'Cancel',
    //       onPress: () => console.log('Cancel Pressed'),
    //       style: 'cancel',
    //     },
    //     { text: 'Start Anyway', onPress: () => {} },
    //   ]);
    // }

    const { data, error } = await supabase
      .from('study_group')
      .update({ has_started: true })
      .eq('id', id)
      .select();

    if (groupMembers) {
      groupMembers.map(async (m) => {
        if (m.profiles.token != currentUser?.token) {
          const message = {
            to: m.profiles.token,
            sound: 'default',
            title: `${currentGroup?.name}`,
            body: `Your Bible study is about to begin! Tap to join.`,
            data: {
              route: `/group/${id}`,
            },
          };
          await axios.post('https://exp.host/--/api/v2/push/send', message, {
            headers: {
              Accept: 'application/json',
              'Accept-encoding': 'gzip, deflate',
              'Content-Type': 'application/json',
            },
          });
        }
      });
    }

    router.push(`/group/${id}`);
  }

  if (currentGroup?.admin_id !== currentUser?.id) {
    return;
  }

  if (!groupMembers) return;

  return (
    <Container>
      <View className="flex-1">
        <View className="mb-5 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => {
                router.push('/(app)/(tabs)');
              }}>
              <AntDesign name="left" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
            </Pressable>
            <Text className="font-nunito-bold text-3xl text-foreground sm:text-4xl">
              {currentGroup?.name}
            </Text>
          </View>
          <Pressable onPress={handlePresentGroupSettingsModalPress} className="">
            <Entypo
              name="dots-three-vertical"
              size={24}
              color={colorScheme === 'dark' ? 'white' : 'black'}
            />
          </Pressable>
        </View>
        {/* SAVING THIS FEATURE FOR THE FIRST UPDATE */}
        {/* {currentGroup?.frequency === 'daily' ? (
          <View className="flex-row items-center gap-2 self-center rounded-xl bg-gray-200 px-3 py-2">
            <Ionicons name="timer-outline" size={24} color="black" />
            <Text className="font-medium">
              {currentGroup?.frequency} at{' '}
              {new Date(currentGroup?.study_time!).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          </View>
        ) : currentGroup?.frequency === 'weekly' ? (
          <View className="flex-row items-center self-center rounded-xl bg-gray-200 px-3 py-2">
            <Ionicons name="timer-outline" size={24} color="black" />

            <Text className="font-medium">
              <Text className="capitalize">{currentGroup?.frequency}</Text>
              <Text> on</Text>{' '}
              {new Date(currentGroup?.study_time!).toLocaleDateString([], {
                weekday: 'long', // e.g., "Wed"
              })}
              s at{' '}
              {new Date(currentGroup?.study_time!).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center gap-2 self-center rounded-xl bg-gray-200 px-3 py-2">
            <Ionicons name="timer-outline" size={24} color="black" />

            <Text className="font-medium">
              <Text className="capitalize">{currentGroup?.frequency}</Text>
              <Text> on </Text>
              {new Date(currentGroup?.study_time!).toLocaleDateString([], {
                weekday: 'long', // e.g., "Wed"
              })}
              s at{' '}
              {new Date(currentGroup?.study_time!).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          </View>
        )} */}

        <View className="flex-1 items-center justify-center gap-3">
          <View className="mt-5 max-h-52 w-full gap-4 rounded-2xl border border-secondary bg-card p-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Text className="font-nunito-semibold text-xl text-foreground sm:text-2xl">
                  Members{' '}
                </Text>
                <FontAwesome5
                  name="user"
                  size={20}
                  color={colorScheme === 'dark' ? 'white' : 'black'}
                />
              </View>
              <Pressable
                onPress={handlePresentJoinModalPress}
                className="flex-row items-center gap-2 rounded-xl bg-secondary p-3 sm:p-4">
                <Entypo name="plus" size={24} color={'black'} />
              </Pressable>
            </View>
            <FlatList
              data={groupMembers}
              numColumns={2}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={() => (
                <View className="items-center">
                  <Text className="font-nunito-semibold text-base text-foreground sm:text-lg">
                    No members have joined yet.
                  </Text>
                </View>
              )}
              renderItem={({ item }) => (
                <View className="flex-1 flex-row items-center  gap-2 ">
                  <View className=" flex-row items-center gap-2">
                    {item.profiles?.avatar_url ? (
                      <Image
                        style={{ width: 30, aspectRatio: 1 / 1 }}
                        className="rounded-full"
                        source={{ uri: item.profiles.avatar_url }}
                      />
                    ) : (
                      <View className="size-10 items-center justify-center rounded-full border border-cardborder bg-card sm:size-12">
                        <Text className="font-nunito-medium text-base uppercase text-foreground sm:text-lg">
                          {item.profiles.username.charAt(0)}
                          {item.profiles.username.charAt(1)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="font-nunito-medium text-base text-foreground sm:text-lg">
                    {item.profiles.username}
                  </Text>
                </View>
              )}
            />
          </View>
          <View className="flex-1 items-center justify-center gap-5 text-base sm:text-lg">
            {currentGroup?.description && (
              <Text className="font-nunito-medium text-lg text-foreground sm:text-xl">
                {currentGroup?.description}
              </Text>
            )}

            <Pressable onPress={startStudy} className="rounded-xl bg-primary p-4">
              <Text className="font-nunito-bold text-lg sm:text-xl">START STUDY</Text>
            </Pressable>
            <Text className="font-nunito-medium text-base text-foreground sm:text-lg">
              As the study leader, you can either start a personal bible study or invite others for
              a group study.
            </Text>
          </View>
        </View>
      </View>
      <JoinGroupModal code={currentGroup?.code!} bottomSheetModalRef={joinModalRef} />
      <GroupSettingsModal
        group_id={currentGroup?.id}
        created={currentGroup?.created_at!}
        admin={groupMembers[0]}
        code={currentGroup?.code!}
        bottomSheetModalRef={groupSettingsModalRef}
      />
    </Container>
  );
};

export default StartStudy;

const styles = StyleSheet.create({});
