import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { note, useUserStore } from '~/store/store';
import { AntDesign, FontAwesome6 } from '@expo/vector-icons';
import { useAccordion } from '~/hooks';
import Animated, { runOnUI, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const SavedNoteItem = ({ item }: { item: note }) => {
  const { setHeight, animateHeightStyle, animateRef, isOpened } = useAccordion();
  const { removeNote } = useUserStore();
  const animatedChevronStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: withTiming(`${isOpened.value ? -180 : 0}deg`, {
          duration: 200,
        }),
      },
    ],
  }));

  function deleteNote() {
    console.log('deleting');
    removeNote(item.id);
  }
  return (
    <View className="gap-2 rounded-xl bg-gray-200 p-4">
      <View className="overflow-hidden">
        <Pressable
          onPress={() => {
            runOnUI(setHeight)();
            //   if (showNotes === item.id) {
            //     setShowNotes('');
            //   } else {
            //     setShowNotes(item.id);
            //   }
          }}
          className="flex-row items-center justify-between">
          <View className="gap-1">
            <Text className="text-sm font-medium italic">{item.creationDate}</Text>
            <Text className="text-xl font-semibold">{item.groupName}</Text>
          </View>
          <Animated.View style={[animatedChevronStyle]}>
            <AntDesign name="down" size={20} color="black" />
          </Animated.View>
        </Pressable>
        <Animated.View style={[animateHeightStyle]}>
          <View className="absolute left-0 top-0">
            <Animated.View ref={animateRef} className="mt-2 gap-3">
              {item.data.map((note) => (
                <View key={note.id}>
                  {note.reference ? (
                    <View className="gap-1 border border-gray-300 bg-light-primary/15  p-3">
                      <Text>{note.reference}</Text>
                      <Text>{note.note}</Text>
                      <Text className="self-end text-sm">by {note.profiles.username}</Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center gap-3">
                      <View className="flex-row items-center gap-2">
                        {note.profiles?.avatar_url ? (
                          <Image
                            className="rounded-full"
                            style={{ width: 20, aspectRatio: 1 / 1 }}
                            source={{ uri: note.profiles.avatar_url }}
                          />
                        ) : (
                          <View className="size-10 items-center justify-center rounded-full bg-gray-300">
                            <Text className="text-base font-medium uppercase">
                              {note.profiles.username.charAt(0)}
                              {note.profiles.username.charAt(1)}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text>{note.note}</Text>
                    </View>
                  )}
                </View>
              ))}
            </Animated.View>
          </View>
        </Animated.View>
      </View>
      <Pressable
        onPress={deleteNote}
        className="mt-5 size-10 items-center justify-center self-start rounded-xl bg-light-accent/25">
        <FontAwesome6 name="trash-alt" size={20} color="black" />
      </Pressable>
    </View>
  );
};

export default SavedNoteItem;

const styles = StyleSheet.create({});
