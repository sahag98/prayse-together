import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import { note, useUserStore } from '~/store/store';
import { AntDesign, FontAwesome6 } from '@expo/vector-icons';
import { useAccordion } from '~/hooks';
import Animated, {
  runOnUI,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

function AccordionItem({ isExpanded, children, viewKey, style, duration = 500 }: any) {
  const height = useSharedValue(0);

  const derivedHeight = useDerivedValue(() =>
    withTiming(height.value * Number(isExpanded.value), {
      duration,
    })
  );
  const bodyStyle = useAnimatedStyle(() => ({
    height: derivedHeight.value,
  }));

  return (
    <Animated.View key={`accordionItem_${viewKey}`} style={[styles.animatedView, bodyStyle, style]}>
      <View
        onLayout={(e) => {
          height.value = e.nativeEvent.layout.height;
        }}
        style={styles.wrapper}>
        {children}
      </View>
    </Animated.View>
  );
}

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

  const open = useSharedValue(false);
  const rotation = useSharedValue(0);
  const [selectedId, setSelectedId] = useState('');
  const onPress = (id: string) => {
    open.value = !open.value;
    // setSelectedId(id);
    if (open.value) {
      console.log('close');

      rotation.value = withSpring(0, {
        damping: 15,
        stiffness: 120,
      });
    } else {
      // setSelectedId('');
      console.log('open');
      rotation.value = withSpring(180, {
        damping: 15,
        stiffness: 120,
      });
    }

    // rotation.value = withSpring(180, {
    //   damping: 15,
    //   stiffness: 120,
    // });
  };

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  return (
    <Pressable onPress={() => onPress(item.id)} className=" rounded-xl bg-gray-200 p-4">
      <View className="flex-row items-center justify-between">
        <View className="gap-1">
          <Text className="text-sm font-medium italic">{item.creationDate}</Text>
          <Text className="text-xl font-semibold">{item.groupName}</Text>
          {/* {selectedId === item.id ? (
                      <Text className="text-xl font-semibold">{selectedId}</Text>
                    ) : null} */}

          {/* <Text className="text-xl font-semibold">{item.id}</Text> */}
        </View>
        <Animated.View style={iconStyle}>
          <AntDesign name="down" size={20} color="black" />
        </Animated.View>
      </View>
      <AccordionItem isExpanded={open} viewKey="Accordion">
        {item.data.map((note) => (
          <View key={note.id}>
            {note.reference ? (
              <View className="gap-1 rounded-lg border border-gray-300 bg-light-primary/15 p-3">
                <Text className="text-base font-medium">{note.reference}</Text>
                <Text className="text-base">{note.note}</Text>
                <Text className="self-end text-sm text-gray-500">by {note.profiles.username}</Text>
              </View>
            ) : (
              <View className="flex-row items-center gap-3 rounded-lg p-3">
                <View className="">
                  {note.profiles?.avatar_url ? (
                    <Image
                      className="size-8 rounded-full"
                      source={{ uri: note.profiles.avatar_url }}
                    />
                  ) : (
                    <View className="size-8 items-center justify-center rounded-full bg-gray-300">
                      <Text className="text-sm font-medium uppercase">
                        {note.profiles.username.charAt(0)}
                        {note.profiles.username.charAt(1)}
                      </Text>
                    </View>
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-base">{note.note}</Text>
                  {/* <Text className="mt-1 text-sm text-gray-500">
                              by {note.profiles.username}
                            </Text> */}
                </View>
              </View>
            )}
          </View>
        ))}
      </AccordionItem>
      <Text onPress={deleteNote} className="mt-3 text-sm font-medium text-red-500">
        Delete
      </Text>
    </Pressable>
  );
};

export default SavedNoteItem;

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    position: 'absolute',
    display: 'flex',
  },
  animatedView: {
    width: '100%',
    overflow: 'hidden',
  },
  box: {
    height: 120,
    width: 120,
    color: '#f8f9ff',
    backgroundColor: '#b58df1',
    borderRadius: 20,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
});
