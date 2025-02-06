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
      <View className="flex-1 gap-10">
        <Text
          onPress={() => Linking.openURL('https://bibletalk.tv/')}
          className="self-center font-nunito-bold text-sm text-secondary sm:text-lg">
          Provided by <Text className="">bibletalk.tv</Text>
        </Text>
        <View className="gap-5">
          <Text className="font-nunito-medium text-lg leading-6 text-foreground sm:text-xl">
            Learn more about Jesus and Christianity as a whole by going through these plans!
          </Text>
          <View className="gap-3">
            <Text className="mt-3 font-nunito-bold text-2xl text-foreground sm:text-3xl">
              Study Plans
            </Text>
            <FlatList
              data={data?.slice(0, 2)}
              // numColumns={2}
              contentContainerStyle={{ gap: 15 }}
              // columnWrapperStyle={{ gap: 15 }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={() => (
                <View className="flex-1 items-center justify-center">
                  <ActivityIndicator />
                </View>
              )}
              keyExtractor={(item) => item?.slug}
              renderItem={({ item }) => (
                <View
                  className={`w-full flex-1 justify-between gap-5 rounded-2xl border border-cardborder bg-card  p-4`}>
                  <View className="gap-3">
                    <Text className="font-nunito-regular text-base text-foreground sm:text-lg">
                      Level {item.type_id}
                    </Text>

                    <Text className="font-nunito-bold text-xl text-foreground">{item.title}</Text>
                    {item.title === 'Basic' ? (
                      <Text className="font-nunito-medium text-base text-foreground sm:text-lg">
                        Christianity vs world religions, the Life of Jesus, grace, faith and more.
                      </Text>
                    ) : (
                      <Text className="font-nunito-medium text-base text-foreground sm:text-lg">
                        An initial dive into the books of the bible such as Exodus, Job, Matthew and
                        more.
                      </Text>
                    )}
                    {/* <Text className="text-xl font-semibold"></Text> */}
                  </View>
                  <Pressable
                    onPress={() => router.push(`/plans/${item.slug}?title=${item.title}`)}
                    className="w-full items-center justify-center rounded-lg bg-primary p-4">
                    <Text className="font-nunito-bold text-base sm:text-lg">View Plan</Text>
                  </Pressable>
                </View>
              )}
            />
          </View>
        </View>
      </View>
    </Container>
  );
};

export default Plans;
