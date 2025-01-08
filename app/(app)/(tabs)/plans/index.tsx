import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Container } from '~/components/Container';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';

const Plans = () => {
  const [plans, setPlans] = useState([]);

  const { data, isFetched, isLoadingError, isLoading } = useQuery({
    queryKey: ['series'],
    queryFn: fetchSeries,
  });

  async function fetchSeries() {
    try {
      const response = await fetch('https://bibletalk.tv/plans.json');
      if (!response.ok) {
        throw new Error('Failed to fetch Bible plans');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.log(err);
    }
  }
  // useEffect(() => {

  //   fetchPlans();
  // }, []);

  return (
    <Container>
      <View className="flex-1 justify-between gap-3">
        <Text
          onPress={() => Linking.openURL('https://bibletalk.tv/')}
          className="self-center text-sm font-semibold text-cyan-600">
          Provided by <Text className="">bibletalk.tv</Text>
        </Text>
        <Text className="mb-1 mt-3 text-2xl font-bold leading-6">Study Plans</Text>
        <FlatList
          data={data}
          numColumns={2}
          contentContainerStyle={{ gap: 15 }}
          columnWrapperStyle={{ gap: 15 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator />
            </View>
          )}
          keyExtractor={(item) => item?.slug}
          renderItem={({ item }) => (
            <View
              style={{ backgroundColor: `#${item.hex}` }}
              className={`aspect-square max-h-48 w-1/2 flex-1 justify-between gap-5 rounded-lg  p-3`}>
              <View className="gap-3">
                <Text>Level {item.type_id}</Text>

                <Text className="text-xl font-semibold">{item.title}</Text>
              </View>
              <Pressable
                onPress={() => router.push(`/plans/${item.slug}?title=${item.title}`)}
                className="w-full items-center justify-center rounded-lg bg-light-background px-4 py-3">
                <Text className=" font-bold">View Plan</Text>
              </Pressable>
            </View>
          )}
        />
      </View>
    </Container>
  );
};

export default Plans;

const styles = StyleSheet.create({});
