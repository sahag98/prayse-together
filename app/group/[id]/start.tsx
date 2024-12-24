import {
  ActivityIndicator,
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
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import JoinGroupModal from '~/modals/join-group';
import { GroupMembers } from '~/types/types';

const StartStudy = () => {
  const { currentUser } = useAuth();
  const { id } = useLocalSearchParams();
  const [currentGroup, setCurrentGroup] = useState<Tables<'study_group'> | null>();
  const [groupMembers, setGroupMembers] = useState<GroupMembers[] | null>();
  const joinModalRef = useRef<BottomSheetModal>(null);
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
      .eq('group_id', id)
      .neq('user_id', currentUser?.id);

    if (group_members) {
      //@ts-expect-error
      setGroupMembers(group_members);
    }
  }

  async function startStudy() {
    const { data, error } = await supabase
      .from('study_group')
      .update({ has_started: true })
      .eq('id', id)
      .select();
    router.push(`/group/${id}`);
  }

  if (currentGroup?.admin_id !== currentUser?.id) {
    return;
  }

  return (
    <Container>
      <View className="flex-1 px-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <Pressable
              onPress={() => {
                router.push('/(tabs)/home');
              }}>
              <AntDesign name="left" size={24} color="black" />
            </Pressable>
          </View>
          <Pressable
            onPress={handlePresentJoinModalPress}
            className="flex-row items-center gap-2 rounded-xl bg-light-secondary/50 p-3">
            <AntDesign name="addusergroup" size={30} color="black" />
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center gap-3">
          <View className="mt-5 max-h-52 w-full items-center gap-2 rounded-2xl bg-light-secondary/50 p-3">
            <Text className="text-xl font-semibold">Joined members</Text>
            <FlatList
              data={groupMembers}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={() => (
                <View className="items-center">
                  <Text>No members yet.</Text>
                </View>
              )}
              renderItem={({ item }) => (
                <View className="w-full flex-row items-center gap-2 ">
                  <View className=" flex-row items-center gap-2">
                    {item.profiles?.avatar_url ? (
                      <Image source={{ uri: item.profiles.avatar_url }} />
                    ) : (
                      <View className="size-10 items-center justify-center rounded-full bg-gray-200">
                        <Text className="text-base font-medium uppercase">
                          {item.profiles.username.charAt(0)}
                          {item.profiles.username.charAt(1)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text>{item.profiles.username}</Text>
                </View>
              )}
            />
          </View>
          <View className="flex-1 items-center justify-center gap-3">
            <Text className="text-2xl font-bold">{currentGroup?.name}</Text>
            <Pressable onPress={startStudy} className="rounded-xl bg-light-primary p-4">
              <Text className="text-lg font-bold">START STUDY</Text>
            </Pressable>
          </View>
        </View>
      </View>
      <JoinGroupModal code={currentGroup?.code!} bottomSheetModalRef={joinModalRef} />
    </Container>
  );
};

export default StartStudy;

const styles = StyleSheet.create({});
