import { Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Container } from '~/components/Container';
import { supabase } from '~/utils/supabase';
import { Tables } from '~/database.types';
import { Feather, FontAwesome6 } from '@expo/vector-icons';

const GroupPage = () => {
  const { id } = useLocalSearchParams();
  const [currentGroup, setCurrentGroup] = useState<Tables<'study_group'> | null>();
  console.log('id: ', id);

  async function getGroup() {
    let { data: study_group, error } = await supabase
      .from('study_group')
      .select('*')
      // Filters
      .eq('id', id);

    if (!study_group) return;
    setCurrentGroup(study_group[0]);
  }

  useEffect(() => {
    getGroup();
  }, [id]);

  return (
    <Container>
      <View className="flex-1 justify-between px-4">
        <Text className="text-2xl font-bold">{currentGroup?.name}</Text>
        <View className="gap-3">
          <Pressable className="items-center justify-center gap-2 rounded-xl bg-light-primary p-6">
            <FontAwesome6 name="person" size={35} color="black" />
            <Text className="font-semibold">In Person Study</Text>
          </Pressable>
          <Pressable className="items-center justify-center gap-2 rounded-xl bg-light-primary p-6">
            <Feather name="globe" size={35} color="black" />
            <Text className="font-semibold">Online Study</Text>
          </Pressable>
        </View>
        <Text
          onPress={() => router.push('/(tabs)/home')}
          className="mb-10 self-center font-bold underline">
          Not now
        </Text>
      </View>
    </Container>
  );
};

export default GroupPage;

const styles = StyleSheet.create({});
