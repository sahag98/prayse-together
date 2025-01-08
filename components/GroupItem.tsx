import { Image, Pressable, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { GroupMembers, Note } from '~/types/types';
import { supabase } from '~/utils/supabase';
import { useAuth } from '~/providers/auth-provider';
import { useQuery, useQueryClient } from '@tanstack/react-query';

type GroupItemProps = {
  title: string;
};

const GroupItem = ({ item }: { item: GroupMembers }) => {
  const [recentNotes, setRecentNotes] = useState<Note | null>();

  const {
    data: groupAdmin,
    isFetched,
    isLoadingError,
    isLoading,
  } = useQuery({
    queryKey: ['admin', item.group_id],
    queryFn: getGroupAdmin,
  });

  const { data: groupMembers } = useQuery({
    queryKey: ['members', item.group_id],
    queryFn: getGroupMembers,
  });
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  useEffect(() => {
    const channel = supabase
      .channel('group')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'group_members', filter: `group_id=eq.${item.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            queryClient.invalidateQueries({
              queryKey: ['members', item.group_id],
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [item.id]);

  // useEffect(() => {
  //   getGroupAdmin();
  // }, [item.id]);

  async function getGroupMembers() {
    const { data, error } = await supabase
      .from('group_members')
      .select('*, profiles(*)')
      .eq('group_id', item.group_id);
    // .neq('user_id', currentUser?.id);

    return data;
  }

  async function getGroupAdmin() {
    const { data, error } = await supabase
      .from('group_members')
      .select('*, profiles(*)')
      .eq('group_id', item.group_id)
      .eq('user_id', item.study_group.admin_id)
      .single();

    return data;
  }

  if (!groupAdmin?.profiles) return;

  return (
    <Link asChild href={`/group/${item.group_id}`}>
      <Pressable className="aspect-square max-h-52 w-1/2 flex-1 justify-between gap-2 rounded-lg border-gray-300 bg-gray-200 p-3">
        <View className="gap-2">
          <Text className="text-lg font-semibold">{item.study_group.name}</Text>
          {groupAdmin?.profiles?.id !== currentUser?.id && (
            <View className="flex-row items-center gap-1.5 text-sm">
              {groupAdmin?.profiles?.avatar_url ? (
                <Image
                  style={{ width: 20, height: 20 }}
                  source={{ uri: groupAdmin.profiles.avatar_url }}
                  className="size-10 rounded-full"
                />
              ) : (
                <View className="rounded-full bg-light-background p-1">
                  <Feather name="user" size={12} color="black" />
                </View>
              )}

              <Text className="text-sm text-gray-500">{groupAdmin?.profiles?.username}</Text>
            </View>
          )}
        </View>
        <View className="flex-row items-center gap-0.5">
          {groupMembers?.slice(0, 4).map((member, index) => (
            <View
              style={{
                position: 'relative',
                marginLeft: index > 0 ? -10 : 0,
              }}
              className="size-7 items-center justify-center rounded-full border border-gray-400 bg-light-secondary"
              key={member.user_id}>
              <Text className="text-xs uppercase">
                {member.profiles?.username?.charAt(0)}
                {member.profiles?.username?.charAt(1)}
              </Text>
            </View>
          ))}
          {groupMembers?.length! > 4 && <Text className="ml-1 text-xs">and more</Text>}
          <Text></Text>
        </View>

        {/* <View className="mt-auto items-center justify-center rounded-lg bg-light-primary p-4">
          <Text className="font-bold">
            {groupAdmin?.profiles?.id === item.user_id ? 'Start Study' : 'Join Study'}
          </Text>
        </View> */}

        {/* <View className="h-[0.5px] w-full bg-gray-300" />
        <Text className="text-sm text-gray-800">Most Recent Note</Text>
        {recentNotes && (
          <Text className="flex-1 truncate text-sm text-gray-500">{recentNotes.note}</Text>
        )} */}
      </Pressable>
    </Link>
  );
};

export default GroupItem;
