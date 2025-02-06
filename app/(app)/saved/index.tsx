import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Container } from '~/components/Container';
import { useUserStore } from '~/store/store';
import { router } from 'expo-router';
import { AntDesign, FontAwesome6, Ionicons } from '@expo/vector-icons';
import SavedNoteItem from '~/components/SavedNoteItem';
import { useTheme } from '~/providers/theme-provider';

const SavesScreen = () => {
  const { colorScheme } = useTheme();
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
              <AntDesign name="left" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
            </Pressable>
            <Text className="font-nunito-bold text-3xl text-foreground  sm:text-4xl">
              Saved Notes
            </Text>
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
          {/* <Button onPress={onPress} title="Click me" /> */}

          <FlatList
            data={notes.toReversed()}
            contentContainerStyle={{ flexGrow: 1, gap: 10 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View className="flex-1 items-center justify-center gap-2">
                <Ionicons
                  name="bookmarks-outline"
                  size={60}
                  color={colorScheme === 'dark' ? 'white' : 'black'}
                />
                <Text className="font-nunito-medium text-lg text-foreground sm:text-xl">
                  No saved notes yet.
                </Text>
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

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    position: 'absolute',
    display: 'flex',
  },
  animatedView: {
    width: '100%',
    overflow: 'hidden',
  },
  box: {
    height: 120,
    width: 120,
    color: '#f8f9ff',
    backgroundColor: '#b58df1',
    borderRadius: 20,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
});
