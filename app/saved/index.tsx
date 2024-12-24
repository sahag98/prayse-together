import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import { Container } from '~/components/Container';
import { useUserStore } from '~/store/store';
import { router } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import SavedNoteItem from '~/components/SavedNoteItem';

const SavesScreen = () => {
  const { notes } = useUserStore();

  const [showNotes, setShowNotes] = useState('');

  return (
    <Container>
      <View className="flex-1 px-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <Pressable
              onPress={() => {
                router.push('/(tabs)/home');
              }}>
              <AntDesign name="left" size={24} color="black" />
            </Pressable>
            <Text className="text-2xl font-bold">Saved Notes</Text>
          </View>
        </View>
        <View className="mt-5 flex-1">
          <FlatList
            data={notes.toReversed()}
            contentContainerStyle={{ flexGrow: 1, gap: 10 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View className="flex-1 items-center justify-center">
                <Text className="font-medium">No saved notes yet</Text>
              </View>
            )}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <SavedNoteItem item={item} />}
          />
        </View>
      </View>
    </Container>
  );
};

export default SavesScreen;

const styles = StyleSheet.create({});
