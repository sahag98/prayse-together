import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Container } from '~/components/Container';
import { useUserStore } from '~/store/store';
import { router } from 'expo-router';
import { AntDesign, FontAwesome6, Ionicons } from '@expo/vector-icons';
import SavedNoteItem from '~/components/SavedNoteItem';

const SavesScreen = () => {
  const { notes, removeAll } = useUserStore();

  function deleteAllNotes() {
    removeAll();
  }

  return (
    <Container>
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => {
                router.back();
              }}>
              <AntDesign name="left" size={24} color="black" />
            </Pressable>
            <Text className="text-3xl font-bold">Saved Notes</Text>
          </View>
          {notes.length > 0 && (
            <Pressable
              onPress={() =>
                Alert.alert(
                  'Delete Notes',
                  'This action will permenantly delete all your saved notes.',
                  [
                    {
                      text: 'Cancel',
                      onPress: () => console.log('Cancel Pressed'),
                      style: 'cancel',
                    },
                    { text: 'Delete', style: 'destructive', onPress: deleteAllNotes },
                  ]
                )
              }
              className="size-10 items-center justify-center self-start rounded-xl">
              <FontAwesome6 name="trash-alt" size={30} color="#ff4d4d" />
            </Pressable>
          )}
        </View>
        <View className="mt-5 flex-1">
          <FlatList
            data={notes.toReversed()}
            contentContainerStyle={{ flexGrow: 1, gap: 10 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View className="flex-1 items-center justify-center gap-2">
                <Ionicons name="bookmarks-outline" size={60} color="black" />
                <Text className="text-lg font-medium">No saved notes yet.</Text>
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
