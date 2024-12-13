import { Image, Pressable, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { GroupMembers, Note } from '~/types/types';
import { supabase } from '~/utils/supabase';
import { useAuth } from '~/providers/auth-provider';

type GroupItemProps = {
  title: string;
};

const GroupItem = ({ item }: { item: GroupMembers }) => {
  const [recentNotes, setRecentNotes] = useState<Note | null>();

  const { currentUser } = useAuth();

  async function getRecentNotes() {
    let { data: group_notes, error } = await supabase
      .from('group_notes')
      .select('*')
      .eq('group_id', item.group_id)
      .single();

    setRecentNotes(group_notes);
  }

  useEffect(() => {
    getRecentNotes();
  }, [item.id]);

  const getLastWords = (text: string | undefined, wordCount: number) => {
    if (!text) return '';
    const cleanedText = text.trim().replace(/\s+/g, ' '); // Remove extra spaces
    const words = cleanedText.split(' ');
    return words.slice(-wordCount).join(' ');
  };

  return (
    <Link asChild href={`/group/${item.group_id}`}>
      <Pressable className="aspect-square w-1/2 flex-1 gap-2 rounded-lg border-gray-300 bg-gray-200 p-3">
        <Text className="text-xl font-bold">{item.study_group.name}</Text>
        {item.study_group.admin_id === item.profiles.id && (
          <View className="flex-row items-center gap-2 text-sm">
            {item.profiles.avatar_url ? (
              <Image
                style={{ width: 15, height: 15 }}
                source={{ uri: item.profiles.avatar_url }}
                className="size-10"
              />
            ) : (
              <View className="rounded-full bg-light-background p-1">
                <Feather name="user" size={15} color="black" />
              </View>
            )}

            <Text className="text-gray-500">{item.profiles.username}</Text>
          </View>
        )}
        <View className="h-[0.5px] w-full bg-gray-300" />
        <Text className="text-sm text-gray-800">Most Recent Note</Text>
        <Text className="flex-1 truncate text-sm text-gray-500">
          {getLastWords(recentNotes?.note!, 50)} {/* Change 2 to the desired number of words */}
        </Text>
        <View className="mt-auto">
          {item.profiles.id !== item.study_group.admin_id && (
            <>
              {item.profiles.avatar_url ? (
                <Image
                  style={{ width: 15, height: 15 }}
                  source={{ uri: item.profiles.avatar_url }}
                  className="size-10"
                />
              ) : (
                <View className="flex size-7 items-center justify-center rounded-full bg-light-background p-1">
                  <Feather name="user" size={15} color="black" />
                </View>
              )}
            </>
          )}
        </View>
      </Pressable>
    </Link>
  );
};

export default GroupItem;
