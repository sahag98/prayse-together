import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Button, Pressable, TextInput } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModal, BottomSheetView, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Feather } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '~/utils/supabase';
import { router } from 'expo-router';
const CreateBottomModal = ({
  bottomSheetModalRef,
  updateProfile,
}: {
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
  updateProfile: () => void;
}) => {
  const [groupname, setGroupname] = useState('');
  const [groupdescription, setGroupdescription] = useState('');
  const [groupFrequency, setGroupFrequency] = useState('');
  // ref
  const snapPoints = useMemo(() => ['75%'], []);
  // callbacks

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  async function finalizeSetup() {
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    try {
      // Generate a random 6-digit number
      const { data, error } = await supabase
        .from('study_group')
        .insert([
          {
            name: groupname,
            description: groupdescription,
            frequency: groupFrequency,
            code: randomCode,
          },
        ])
        .select();

      if (!data) return;
      console.log('group info:', data[0].id);
      router.push(`/group/${data[0].id}`);
    } catch (error) {
    } finally {
      updateProfile();
    }
  }

  // renders
  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={snapPoints}
        index={1}
        handleStyle={{
          borderTopWidth: 1,
          borderTopColor: 'gainsboro',
        }}
        onChange={handleSheetChanges}>
        <BottomSheetView style={styles.contentContainer}>
          <View className="flex-row items-center gap-3">
            <FontAwesome5 name="bible" size={24} color="black" />
            <Text className="text-lg font-medium">Create Bible study group</Text>
          </View>
          <View className="mt-4 gap-3">
            <TextInput
              value={groupname}
              onChangeText={setGroupname}
              placeholder="Enter group name"
              className="rounded-3xl bg-gray-200 p-4 placeholder:text-light-foreground/60"
              //   style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
            />
            <TextInput
              value={groupdescription}
              onChangeText={setGroupdescription}
              placeholder="Enter group description"
              className="rounded-3xl bg-gray-200 p-4 placeholder:text-light-foreground/60"
              //   style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
            />
            <View className="gap-3">
              <Text className="text-lg font-medium">Frequency</Text>
              <View className="w-full flex-row gap-3">
                <Pressable
                  onPress={() => setGroupFrequency('daily')}
                  className={
                    groupFrequency === 'daily'
                      ? 'flex-1 items-center justify-center rounded-xl bg-light-secondary p-6'
                      : 'flex-1 items-center justify-center rounded-xl bg-gray-200 p-6'
                  }>
                  <Text className="font-semibold">Daily</Text>
                </Pressable>
                <Pressable
                  onPress={() => setGroupFrequency('weekly')}
                  className={
                    groupFrequency === 'weekly'
                      ? 'flex-1 items-center justify-center rounded-xl bg-light-secondary p-6'
                      : 'flex-1 items-center justify-center rounded-xl bg-gray-200 p-6'
                  }>
                  <Text className="font-semibold">Weekly</Text>
                </Pressable>
                <Pressable
                  onPress={() => setGroupFrequency('monthly')}
                  className={
                    groupFrequency === 'monthly'
                      ? 'flex-1 items-center justify-center rounded-xl bg-light-secondary p-6'
                      : 'flex-1 items-center justify-center rounded-xl bg-gray-200 p-6'
                  }>
                  <Text className="font-semibold">Monthly</Text>
                </Pressable>
              </View>
            </View>
            <Pressable
              onPress={finalizeSetup}
              className="mt-4 items-center justify-center rounded-3xl bg-light-primary p-4">
              <Text className="text-base font-semibold">Create</Text>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    padding: 10,
  },
});

export default CreateBottomModal;
