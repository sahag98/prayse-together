import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import { note, useUserStore } from '~/store/store';
import { AntDesign } from '@expo/vector-icons';
import { useAccordion } from '~/hooks';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '~/providers/theme-provider';
import * as Print from 'expo-print';

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
      <View onLayout={(e) => (height.value = e.nativeEvent.layout.height)} style={styles.wrapper}>
        {children}
      </View>
    </Animated.View>
  );
}

const SavedNoteItem = ({ item }: { item: note }) => {
  const { colorScheme } = useTheme();
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

  const handlePrint = async () => {
    const notesHtml = item.data
      .map(
        (note) => `
        <div style="margin-bottom: 10px; padding: 10px; border-bottom: 1px solid #ddd;">
          ${note.reference ? `<h3>${note.reference}</h3>` : ''}
          <p>${note.note}</p>
          <small>By: ${note.profiles?.username || 'Unknown'}</small>
        </div>`
      )
      .join('');

    const htmlContent = `
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${item.groupName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; }
          h3 {text-align:center; }
          div { margin-bottom: 15px; }
        </style>
      </head>
      <body>
        <h1>${item.groupName}</h1>
        <h3>${item.creationDate}</h3>
        ${notesHtml}
      </body>
    </html>`;

    await Print.printAsync({ html: htmlContent });
  };

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
    <Pressable
      onPress={() => onPress(item.id)}
      className=" rounded-2xl border border-cardborder bg-card p-4">
      <View className="mb-4 flex-row items-center justify-between">
        <View className="gap-1">
          <Text className="text-sm font-medium italic text-foreground sm:text-lg">
            {item.creationDate}
          </Text>
          <Text className="text-xl font-semibold text-foreground sm:text-2xl">
            {item.groupName}
          </Text>
          {/* {selectedId === item.id ? (
                      <Text className="text-xl font-semibold">{selectedId}</Text>
                    ) : null} */}

          {/* <Text className="text-xl font-semibold">{item.id}</Text> */}
        </View>
        <Animated.View style={iconStyle}>
          <AntDesign name="down" size={20} color={colorScheme === 'dark' ? 'white' : 'black'} />
        </Animated.View>
      </View>
      <AccordionItem isExpanded={open} viewKey="Accordion">
        {item.data.map((note) => (
          <View key={note.id}>
            {note.reference ? (
              <View className="gap-1 rounded-lg border border-cardborder bg-card p-3">
                <Text className="font-nunito-medium text-base text-foreground">
                  {note.reference}
                </Text>
                <Text className="font-nunito-medium text-base text-foreground sm:text-lg">
                  {note.note}
                </Text>
                <Text className="self-end font-nunito-regular text-sm text-foreground sm:text-base ">
                  by {note.profiles.username}
                </Text>
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
                    <View className="size-8 items-center justify-center rounded-full border border-cardborder bg-card sm:size-12">
                      <Text className="font-nunito-medium text-sm uppercase text-foreground sm:text-lg">
                        {note.profiles.username.charAt(0)}
                        {note.profiles.username.charAt(1)}
                      </Text>
                    </View>
                  )}
                </View>
                <View className="flex-1">
                  <Text className="font-nunito-medium text-base text-foreground sm:text-lg">
                    {note.note}
                  </Text>
                  {/* <Text className="mt-1 text-sm text-gray-500">
                              by {note.profiles.username}
                            </Text> */}
                </View>
              </View>
            )}
          </View>
        ))}
      </AccordionItem>
      <View className="flex-row items-center justify-between">
        <Text
          onPress={deleteNote}
          className="mt-3 font-nunito-semibold text-base text-red-500 sm:text-lg">
          Delete
        </Text>

        <Text
          onPress={handlePrint}
          className="mt-3 font-nunito-semibold text-base text-blue-500 sm:text-lg">
          Print
        </Text>
      </View>
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
