import { ActivityIndicator, ScrollView, Pressable, Text, View, Alert, Share } from 'react-native';
import React, { useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { Container } from '~/components/Container';
import { AntDesign, Feather, Ionicons } from '@expo/vector-icons';
import { useTheme } from '~/providers/theme-provider';
import { router, useLocalSearchParams } from 'expo-router';
import { Bible } from '../..';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const ChapterIndex = () => {
  const { chapter: chapterName, book: bookName } = useLocalSearchParams();

  const bibleData: Bible = require('~/assets/nkjv.json');

  const { colorScheme } = useTheme();

  const chapters = bibleData.books.find((book) => book.name === bookName)?.chapters;

  if (!chapters) return <ActivityIndicator />;
  const verses = chapters[Number(chapterName) - 1].verses;
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);

  // Toggle verse selection
  const toggleVerseSelection = (verseNum: number) => {
    setSelectedVerses(
      (prevSelected) =>
        prevSelected.includes(verseNum)
          ? prevSelected.filter((num) => num !== verseNum) // Deselect if already selected
          : [...prevSelected, verseNum] // Select if not already selected
    );
  };

  // Copy selected verses to clipboard
  const copySelectedVerses = async () => {
    if (selectedVerses.length === 0) return;

    const selectedText = selectedVerses
      .sort((a, b) => a - b) // Sort verses in order
      .map((num) => {
        const verse = verses.find((v: any) => v.num === num);
        return verse ? `${num}. ${verse.text}` : '';
      })
      .join('\n');

    const fullText = `${bookName} ${chapterName}:\n${selectedText}`;
    await Clipboard.setStringAsync(fullText);

    // Clear selection after copying
    setSelectedVerses([]);
  };

  const shareSelectedVerses = async () => {
    if (selectedVerses.length === 0) return;

    const selectedText = selectedVerses
      .sort((a, b) => a - b) // Sort verses in order
      .map((num) => {
        const verse = verses.find((v: any) => v.num === num);
        return verse ? `${num}. ${verse.text}` : '';
      })
      .join('\n');

    const fullText = `${bookName} ${chapterName}:\n${selectedText}`;

    await Share.share({
      //  title: `Hey! Join my bible study group 📖`,
      message: fullText,
    });
    // await Clipboard.setStringAsync(fullText);

    // Clear selection after copying
    setSelectedVerses([]);
  };

  return (
    <Container>
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => {
              router.back();
            }}>
            <AntDesign name="left" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
          </Pressable>
          <Text className="font-nunito-bold text-3xl text-foreground sm:text-4xl">
            {bookName} {chapterName}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="font-nunito-regular text-xl leading-8 text-foreground">
          {verses.map((verse: any) => (
            <Text key={verse.num} onPress={() => toggleVerseSelection(verse.num)}>
              <Text
                className={`font-nunito-regular text-xl leading-8 text-foreground ${
                  selectedVerses.includes(verse.num) ? 'text-blue-500 underline' : ''
                }`}>
                <Text className="font-nunito-bold">{verse.num}. </Text>
                <Text>{verse.text + ' '}</Text>
              </Text>
            </Text>
          ))}
        </Text>
      </ScrollView>
      {selectedVerses.length > 0 && (
        <Animated.View
          key={'bottom'}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
          className="absolute bottom-5 right-5  flex flex-row items-center gap-3">
          <Pressable
            onPress={copySelectedVerses}
            style={
              colorScheme === 'light'
                ? {
                    shadowColor: '#c2c2c2',
                    shadowOffset: {
                      width: 0,
                      height: 5,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.05,
                    elevation: 4,
                  }
                : ''
            }
            className="size-20 items-center justify-center rounded-xl border border-cardborder bg-card">
            <Ionicons
              name="copy-outline"
              size={24}
              color={colorScheme === 'dark' ? 'white' : 'black'}
            />
            <Text className="font-nunito-bold text-foreground">Copy</Text>
          </Pressable>
          <Pressable
            onPress={shareSelectedVerses}
            style={
              colorScheme === 'light'
                ? {
                    shadowColor: '#c2c2c2',
                    shadowOffset: {
                      width: 0,
                      height: 5,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.05,
                    elevation: 4,
                  }
                : ''
            }
            className="size-20 items-center justify-center rounded-xl border border-cardborder bg-card">
            <Feather name="share" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />

            <Text className="font-nunito-bold text-foreground">Share</Text>
          </Pressable>
        </Animated.View>
      )}
    </Container>
  );
};

export default ChapterIndex;
