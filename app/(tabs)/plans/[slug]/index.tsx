import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Container } from '~/components/Container';
import { AntDesign } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '~/store/store';

const SeriesPage = () => {
  const { slug, title } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const { studiedPlans } = useUserStore();
  const { data, isFetched, isLoadingError, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: fetchPlans,
  });

  async function fetchPlans() {
    try {
      const response = await fetch(`https://bibletalk.tv/${slug}.json`);
      if (!response.ok) {
        throw new Error('Failed to fetch Bible plans');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.log(err);
    }
  }

  console.log(!!studiedPlans.find((data) => data === 'introduction-to-genesis'));

  return (
    <Container>
      <View className="flex-1 gap-5 px-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <Pressable
              onPress={() => {
                router.back();
              }}>
              <AntDesign name="left" size={24} color="black" />
            </Pressable>
            <Text className="text-2xl font-bold">{title}</Text>
          </View>
        </View>
        <FlatList
          data={data?.items}
          contentContainerStyle={{ flexGrow: 1, gap: 15 }}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item?.slug}
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator />
            </View>
          )}
          renderItem={({ item }) => (
            <View className="w-full flex-1 gap-3 rounded-lg border-gray-300 bg-gray-200 p-3">
              <Image
                source={{ uri: item.image }}
                style={{ objectFit: 'cover', borderRadius: 10, width: '100%', aspectRatio: 16 / 9 }}
              />
              <View className="flex-row items-center justify-between">
                {/* <Text className="text-2xl font-bold">{item.slug}</Text> */}
                <Text className="flex-1 text-xl font-bold">{item.title}</Text>
                {!!studiedPlans.find((data) => data === item.slug) && (
                  <AntDesign name="checkcircle" size={24} color="green" />
                )}
              </View>
              <Text className="font-medium leading-6">{item.excerpt}</Text>
              <Pressable
                onPress={() => router.push(`/plans/${slug}/${item.slug}?name=${item.title}`)}
                className={
                  !!studiedPlans.find((data) => data === item.slug)
                    ? 'mt-3 w-full items-center justify-center rounded-lg bg-gray-200 p-4'
                    : 'mt-3 w-full items-center justify-center rounded-lg bg-light-primary p-4'
                }>
                {!!studiedPlans.find((data) => data === item.slug) ? (
                  <Text className="font-bold underline">Do it Again</Text>
                ) : (
                  <Text className="text-lg font-bold">Start Lesson</Text>
                )}
              </Pressable>
            </View>
          )}
        />
      </View>
    </Container>
  );
};

export default SeriesPage;

const styles = StyleSheet.create({});
