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
import { useTheme } from '~/providers/theme-provider';

const SeriesPage = () => {
  const { colorScheme } = useTheme();
  const params = useLocalSearchParams();

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const { studiedPlans } = useUserStore();
  const { data, isFetched, isLoadingError, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: fetchPlans,
  });

  async function fetchPlans() {
    try {
      const response = await fetch(`https://bibletalk.tv/${params.slug}.json`);
      if (!response.ok) {
        throw new Error('Failed to fetch Bible plans');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <Container>
      <View className="flex-1 gap-5">
        <View className="mb-1 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => {
                router.push(`/plans/${params.next}?title=Basic`);
              }}>
              <AntDesign name="left" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
            </Pressable>
            <Text className="font-nunito-bold text-3xl text-foreground sm:text-4xl">
              {params.title}
            </Text>
          </View>
        </View>
        <FlatList
          data={data?.items}
          contentContainerStyle={{ flexGrow: 1, gap: 15 }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => <View className="h-24" />}
          keyExtractor={(item) => item?.slug}
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator />
            </View>
          )}
          renderItem={({ item }) => (
            <View className="w-full flex-1 gap-3 rounded-lg border border-cardborder bg-card p-3">
              <Image
                source={{ uri: item.image }}
                className="rounded-lg"
                style={{ objectFit: 'cover', width: '100%', aspectRatio: 16 / 9 }}
              />
              <View className="flex-row items-center justify-between">
                <Text className="flex-1 font-nunito-bold text-2xl text-foreground sm:text-3xl">
                  {item.title}
                </Text>
                {!!studiedPlans.find((data) => data === item.slug) && (
                  <AntDesign name="checkcircle" size={24} color="green" />
                )}
              </View>
              <Text className="font-nunito-medium text-base leading-6 text-foreground sm:text-lg">
                {item.excerpt}
              </Text>
              <Pressable
                onPress={() =>
                  router.push(
                    `/plans/${params.next}/${params.slug}/${item.slug}?name=${item.title}`
                  )
                }
                className={
                  !!studiedPlans.find((data) => data === item.slug)
                    ? 'mt-3 w-full items-center justify-center rounded-lg bg-primary p-4'
                    : 'mt-3 w-full items-center justify-center rounded-lg bg-primary p-4'
                }>
                {!!studiedPlans.find((data) => data === item.slug) ? (
                  <Text className="font-nunito-bold text-base underline sm:text-lg">
                    Do it Again
                  </Text>
                ) : (
                  <Text className="font-nunito-bold text-base sm:text-lg">Start Lesson</Text>
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
