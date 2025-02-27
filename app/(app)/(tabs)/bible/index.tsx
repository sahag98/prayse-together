import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Container } from '~/components/Container';
import { AntDesign } from '@expo/vector-icons';
import { useTheme } from '~/providers/theme-provider';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export type Book = {
  name: string;
  chapters: any[];
};

export type Bible = {
  version: string;
  books: Book[];
};

const BibleIndex = () => {
  const bibleData: Bible = require('~/assets/nkjv.json');
  const { colorScheme } = useTheme();

  const newTestamentStartIndex = bibleData.books.findIndex((book) => book.name === 'Matthew');

  const oldTestamentBooks = bibleData.books.slice(0, newTestamentStartIndex); // Everything before Matthew
  const newTestamentBooks = bibleData.books.slice(newTestamentStartIndex); // Everything after Matthew

  const oldTestamentBookNames = oldTestamentBooks.map((book) => book.name);
  const newTestamentBookNames = newTestamentBooks.map((book) => book.name);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="flex-1 gap-3 pt-3">
        <View className="mx-5 flex-1 gap-2 rounded-xl border border-cardborder bg-card px-5 pb-2 pt-3">
          <View className="flex-row items-center justify-between ">
            <Text className="font-nunito-bold text-xl text-foreground">Old Testament</Text>
            <Text className="font-nunito-medium text-sm text-foreground">39 Books</Text>
          </View>
          <FlatList
            data={oldTestamentBookNames}
            className=" flex-1 "
            contentContainerClassName=""
            keyExtractor={(_, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            // ListHeaderComponent={() => (

            // )}
            contentContainerStyle={{ gap: 10 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => router.push(`/bible/${item}`)}
                className="flex-row items-center justify-between rounded-2xl border border-cardborder bg-card p-4">
                <Text className="font-nunito-semibold text-lg text-foreground">{item}</Text>

                <AntDesign
                  name="right"
                  size={18}
                  color={colorScheme === 'dark' ? 'darkgrey' : 'darkgrey'}
                />
              </Pressable>
            )}
          />
        </View>
        <View className="flex-1 bg-card pb-3 pt-3">
          <View className="mx-5 flex-1 gap-2 rounded-xl border border-cardborder bg-card px-5 pb-2 pt-3">
            <View className="flex-row items-center justify-between ">
              <Text className="font-nunito-bold text-xl text-foreground">New Testament</Text>
              <Text className="font-nunito-medium text-sm text-foreground">27 Books</Text>
            </View>
            <FlatList
              data={newTestamentBookNames}
              className=" flex-1 "
              contentContainerClassName=""
              keyExtractor={(_, index) => index.toString()}
              showsVerticalScrollIndicator={false}
              // ListHeaderComponent={() => (

              // )}
              contentContainerStyle={{ gap: 10 }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => router.push(`/bible/${item}`)}
                  className="flex-row items-center justify-between rounded-2xl border border-cardborder bg-card p-4">
                  <Text className="font-nunito-semibold text-lg text-foreground">{item}</Text>

                  <AntDesign
                    name="right"
                    size={18}
                    color={colorScheme === 'dark' ? 'darkgrey' : 'darkgrey'}
                  />
                </Pressable>
              )}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default BibleIndex;

const styles = StyleSheet.create({});
