import { Appearance, ColorSchemeName, Image, Pressable, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { GroupMembers, Note } from '~/types/types';
import { supabase } from '~/utils/supabase';
import { useAuth } from '~/providers/auth-provider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useTheme } from '~/providers/theme-provider';
type GroupItemProps = {
  title: string;
};

const GroupItem = ({ item }: { item: GroupMembers }) => {
  const { colorScheme } = useTheme();

  const { showActionSheetWithOptions } = useActionSheet();
  const { data: groupAdmin } = useQuery({
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
  const onLongPress = () => {
    const options = ['Delete', 'Save', 'Cancel'];
    const destructiveButtonIndex = 0;
    const cancelButtonIndex = 2;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      (selectedIndex: number | undefined) => {
        switch (selectedIndex) {
          case destructiveButtonIndex:
            // Delete
            break;

          case cancelButtonIndex:
          // Canceled
        }
      }
    );
  };

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
      <Pressable
        onLongPress={onLongPress}
        style={
          colorScheme === 'light'
            ? {
                shadowColor: '#c2c2c2',
                shadowOffset: {
                  width: 0,
                  height: 5,
                },
                shadowOpacity: 0.17,
                shadowRadius: 3.05,
                elevation: 4,
              }
            : ''
        }
        className=" aspect-square max-h-52 flex-1 justify-between gap-2 rounded-2xl border border-cardborder bg-card p-3">
        <View className="gap-2">
          <Text className="font-nunito-semibold text-xl text-foreground sm:text-2xl">
            {item.study_group.name}
          </Text>
          <Text className="font-nunito-medium text-sm text-foreground sm:text-lg">
            {item.study_group.description}
          </Text>
          {groupAdmin?.profiles?.id !== currentUser?.id && (
            <View className="flex-row items-center gap-1.5 text-sm sm:text-base">
              {groupAdmin?.profiles?.avatar_url ? (
                <Image
                  style={{ width: 20, height: 20 }}
                  source={{ uri: groupAdmin.profiles.avatar_url }}
                  className="size-10 rounded-full sm:size-20"
                />
              ) : (
                <View className="rounded-full bg-background p-1 sm:p-2">
                  <Feather
                    name="user"
                    size={12}
                    color={colorScheme === 'dark' ? 'white' : 'black'}
                  />
                </View>
              )}

              <Text className="font-nunito-semibold text-sm text-gray-500 sm:text-base">
                {groupAdmin?.profiles?.username}
              </Text>
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
              className="size-8 items-center justify-center rounded-full border border-gray-400 bg-secondary sm:size-11"
              key={member.user_id}>
              <Text className="font-nunito-semibold text-xs uppercase sm:text-base">
                {member.profiles?.username?.charAt(0)}
                {member.profiles?.username?.charAt(1)}
              </Text>
            </View>
          ))}
          {groupMembers?.length! > 4 && (
            <Text className="ml-1 font-nunito-semibold text-xs sm:text-base">and more</Text>
          )}
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
