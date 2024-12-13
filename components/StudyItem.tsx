import { Image, Pressable, Text, View } from 'react-native';
import React from 'react';

import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { GroupMembers, Lesson } from '~/types/types';

type GroupItemProps = {
  title: string;
};

const StudyItem = ({ item }: { item: Lesson }) => {
  return (
    <Link asChild href={`/group/${item.group_id}`}>
      <Pressable
        style={{
          shadowColor: '#bcbcbc',
          shadowOffset: {
            width: 0,
            height: 3,
          },
          shadowOpacity: 0.17,
          shadowRadius: 3.05,
          elevation: 4,
        }}
        className="aspect-square w-1/2 flex-1 gap-2 rounded-lg border border-gray-300 bg-gray-200 p-3">
        <Text className="text-xl font-bold">{item.title}</Text>
        <View className="h-[0.5px] w-full bg-gray-300" />
        <Text className="text-sm text-gray-500">Most Recent Note</Text>
      </Pressable>
    </Link>
  );
};

export default StudyItem;
