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
          className="self-center text-sm font-bold text-secondary">
          Provided by <Text className="">bibletalk.tv</Text>
        </Text>
        <View className="gap-5">
          <Text className="text-lg font-medium leading-6 text-foreground">
            Learn more about Jesus and Christianity as a whole by going through these plans!
          </Text>
          <View className="gap-4">
            <Text className="mb-1 mt-3 text-2xl font-bold leading-6 text-foreground">
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
                    <Text className="text-foreground">Level {item.type_id}</Text>

                    <Text className="text-xl font-semibold text-foreground">{item.title}</Text>
                    {item.title === 'Basic' ? (
                      <Text className="text-foreground">
                        Christianity vs world religions, the Life of Jesus, grace, faith and more.
                      </Text>
                    ) : (
                      <Text className="text-foreground">
                        An initial dive into the books of the bible such as Exodus, Job, Matthew and
                        more.
                      </Text>
                    )}
                    {/* <Text className="text-xl font-semibold"></Text> */}
                  </View>
                  <Pressable
                    onPress={() => router.push(`/plans/${item.slug}?title=${item.title}`)}
                    className="w-full items-center justify-center rounded-lg bg-primary p-4">
                    <Text className="font-bold">View Plan</Text>
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

const styles = StyleSheet.create({});
