import { Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Note } from '~/types/types';
import { formatDistance, subDays } from 'date-fns';
const NoteItem = ({ item }: { item: Note }) => {
  return (
    <View
      className={
        item.reference
          ? 'gap-1 rounded-md border border-gray-300 bg-light-primary/5 p-3'
          : 'flex-row items-start'
      }>
      <View className="mb-0 flex-1 flex-row items-center justify-between">
        {item.reference && <Text className=" text-lg font-semibold">{item.reference}</Text>}
        <View
          className={
            item.reference ? 'flex-row items-center gap-2' : 'flex-row items-center gap-2'
          }>
          {item.reference && (
            <Text className={item.reference ? 'text-sm' : 'text-lg font-semibold'}>
              {item.reference && 'by'} {item.profiles.username}
            </Text>
          )}

          {/* <View className="flex-row items-center gap-2 self-end">
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
          </View> */}
        </View>
      </View>
      <View className="w-full gap-2">
        {!item.reference && (
          <View className="flex-1 flex-row items-center justify-between">
            <Text className="text-lg font-medium">{item.profiles.username}</Text>
            <Text className="text-xs">
              {formatDistance(new Date(item.created_at), new Date(), { addSuffix: true })}
            </Text>
          </View>
        )}

        <Text className="flex-1">{item.note}</Text>
      </View>
    </View>
  );
};

export default NoteItem;
