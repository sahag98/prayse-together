import { Text, View } from 'react-native';
import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Note } from '~/types/types';
import { formatDistance, subDays } from 'date-fns';
import { Image } from 'expo-image';
import { useTheme } from '~/providers/theme-provider';

const blurhash = 'L1QvwR-;fQ-;~qfQfQfQfQfQfQfQ';
const NoteItem = ({ item }: { item: Note }) => {
  const { colorScheme } = useTheme();
  return (
    <View
      className={
        item.reference
          ? 'gap-1 rounded-2xl border border-cardborder bg-card p-3'
          : 'flex-row items-start'
      }>
      <View className="mb-0 flex-1 flex-row items-center justify-between">
        {item.reference && (
          <Text className=" font-nunito-semibold text-lg text-foreground sm:text-xl">
            {item.reference}
          </Text>
        )}
        <View
          className={
            item.reference ? 'flex-row items-center gap-2' : 'flex-row items-center gap-2'
          }>
          {item.reference && (
            <Text
              className={
                item.reference
                  ? 'font-nunito-medium text-sm text-foreground sm:text-base'
                  : 'font-nunito-medium text-lg font-semibold sm:text-xl'
              }>
              {item.reference && 'by'} {item.profiles.username}
            </Text>
          )}
        </View>
      </View>
      <View className="w-full gap-2 ">
        {!item.reference ? (
          <View className="flex-1 flex-row items-start justify-between gap-3">
            {item.profiles.avatar_url ? (
              <Image
                source={{ uri: item.profiles.avatar_url }}
                style={{ width: 35, height: 35, borderRadius: 100 }}
                placeholder={{ blurhash }}
                contentFit="cover"
                transition={1000}
              />
            ) : (
              <View className="rounded-full border border-cardborder bg-card p-2">
                <Feather name="user" size={25} color={colorScheme === 'dark' ? 'white' : 'black'} />
              </View>
            )}

            <View className="flex-1 gap-1">
              <View className="w-full flex-row items-center justify-between">
                <Text className="font-nunito-medium text-lg text-foreground sm:text-xl">
                  {item.profiles.username}
                </Text>
                <Text className="font-nunito-regular text-xs text-foreground sm:text-base">
                  {formatDistance(new Date(item.created_at), new Date(), { addSuffix: true })}
                </Text>
              </View>
              <Text className="flex-1 font-nunito-medium text-base text-foreground sm:text-lg">
                {item.note}
              </Text>
            </View>
          </View>
        ) : (
          <Text className="flex-1 font-nunito-medium text-base text-foreground sm:text-lg">
            {item.note}
          </Text>
        )}
      </View>
    </View>
  );
};

export default NoteItem;
