import {
  ActivityIndicator,
  Appearance,
  ColorSchemeName,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Container } from '~/components/Container';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AntDesign, Feather } from '@expo/vector-icons';

const Plans = () => {
  const { next, title } = useLocalSearchParams();

  const [colorScheme, setColorScheme] = useState<ColorSchemeName | string>(
    Appearance.getColorScheme()
  );

  //   console.log('params: ', params);

  const { data, isFetched, isLoadingError, isLoading } = useQuery({
    queryKey: ['study'],
    queryFn: fetchSeries,
  });

  async function fetchSeries() {
    try {
      const response = await fetch(`https://bibletalk.tv/plans/${next}.json`);
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
      <View className="flex-1 gap-3">
        <View className="mb-2 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => {
                router.push('/plans');
              }}>
              <AntDesign name="left" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
            </Pressable>
            <Text className="text-3xl font-bold text-foreground">{title} Plans</Text>
          </View>
        </View>
        <FlatList
          data={data?.series}
          numColumns={1}
          contentContainerStyle={{ flexGrow: 1, gap: 10 }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => <View className="h-24" />}
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator />
            </View>
          )}
          keyExtractor={(item) => item?.slug}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/plans/${next}/${item.slug}?title=${item.title}`)}
              className="w-full flex-1 flex-row items-center justify-between gap-5 overflow-hidden rounded-2xl border border-cardborder bg-card p-3">
              <View className="flex-1 flex-row items-center gap-4  ">
                <Image
                  source={{ uri: item.image }}
                  style={{
                    objectFit: 'cover',
                    borderRadius: 10,
                    backgroundColor: 'gainsboro',
                    width: '25%',
                    aspectRatio: 1 / 1,
                  }}
                />

                <View className="w-fit flex-1 gap-7">
                  <Text className="text-lg font-semibold text-foreground">{item.title}</Text>
                </View>
              </View>

              {/* <View className="h-full w-20 items-center justify-center bg-primary">
                <AntDesign name="right" size={24} color="black" />
              </View> */}
            </Pressable>
          )}
        />
      </View>
    </Container>
  );
};

export default Plans;

const styles = StyleSheet.create({});
