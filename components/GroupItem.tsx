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
  const [groupAdmin, setGroupAdmin] = useState<GroupMembers | null>();

  const { currentUser } = useAuth();

  useEffect(() => {
    getGroupAdmin();
  }, [item.id]);

  async function getGroupAdmin() {
    const { data, error } = await supabase
      .from('group_members')
      .select('*, profiles(*)')
      .eq('group_id', item.group_id)
      .eq('user_id', item.study_group.admin_id)
      .single();
    //@ts-expect-error
    setGroupAdmin(data);
  }

  async function getRecentNotes() {
    let { data: group_notes, error } = await supabase
      .from('group_notes')
      .select('*')
      .eq('group_id', item.group_id)
      .order('id', { ascending: false });

    //@ts-expect-error
    setRecentNotes(group_notes[0]);
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
      <Pressable className="aspect-square max-h-52 w-1/2 flex-1 gap-2 rounded-lg border-gray-300 bg-gray-200 p-3">
        <Text className="text-xl font-bold">{item.study_group.name}</Text>

        <View className="flex-row items-center gap-1.5 text-sm">
          {groupAdmin?.profiles.avatar_url ? (
            <Image
              style={{ width: 10, height: 10 }}
              source={{ uri: item.profiles.avatar_url }}
              className="size-10"
            />
          ) : (
            <View className="rounded-full bg-light-background p-1">
              <Feather name="user" size={12} color="black" />
            </View>
          )}
          {groupAdmin?.profiles.id === currentUser?.id ? (
            <Text className="text-sm text-gray-500">You</Text>
          ) : (
            <Text className="text-sm text-gray-500">{groupAdmin?.profiles.username}</Text>
          )}
        </View>

        <View className="h-[0.5px] w-full bg-gray-300" />
        <Text className="text-sm text-gray-800">Most Recent Note</Text>
        {recentNotes && (
          <Text className="flex-1 truncate text-sm text-gray-500">{recentNotes.note}</Text>
        )}
      </Pressable>
    </Link>
  );
};

export default GroupItem;
