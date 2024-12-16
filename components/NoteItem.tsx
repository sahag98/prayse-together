import { Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Note } from '~/types/types';

const NoteItem = ({ item }: { item: Note }) => {
  return (
    <View
      className={
        item.reference
          ? 'gap-1 rounded-md border border-gray-300 bg-light-primary/5 p-3'
          : 'gap-1 rounded-md border border-gray-300 bg-light-secondary/5 p-3'
      }>
      <View className="mb-2 flex-row items-center justify-between">
        {item.reference && <Text className="text-lg font-semibold">{item.reference}</Text>}
        <View
          className={
            item.reference ? 'flex-row items-center gap-2' : 'flex-row-reverse items-center gap-2'
          }>
          <Text className={item.reference ? 'text-sm' : 'text-lg font-semibold'}>
            {item.reference && 'by'} {item.profiles.username}
          </Text>
          <View className="flex-row items-center gap-2 self-end">
            {item.profiles?.avatar_url ? (
              <Image source={{ uri: item.profiles.avatar_url }} />
            ) : (
              <Feather
                className="rounded-full border border-gray-300 bg-gray-200 p-1"
                name="user"
                size={20}
                color="black"
              />
            )}
          </View>
        </View>
      </View>
      <Text>{item.note}</Text>
    </View>
  );
};

export default NoteItem;
