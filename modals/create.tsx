import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Button, Pressable, TextInput } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModal, BottomSheetView, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Feather } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '~/utils/supabase';
import { router } from 'expo-router';
import { Tables } from '~/database.types';
const CreateGroupBottomModal = ({
  bottomSheetModalRef,
  currentUser,
}: {
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
  currentUser: Tables<'profiles'> | null;
}) => {
  const [groupname, setGroupname] = useState('');
  const [groupdescription, setGroupdescription] = useState('');
  const [groupFrequency, setGroupFrequency] = useState('');
  const [groupCode, setGroupCode] = useState<number | null>();
  const [activeTab, setActiveTab] = useState('create');
  // ref
  const snapPoints = useMemo(() => ['50%', '75%'], []);
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
            admin_id: currentUser?.id,
          },
        ])
        .select();

      if (!data) return;

      const { data: insertMemberData, error: insertMemberError } = await supabase
        .from('group_members')
        .insert([
          {
            group_id: data[0].id,
            user_id: currentUser?.id,
            is_admin: true,
          },
        ])
        .select();
      console.log(insertMemberError);
      console.log(insertMemberData);
    } catch (error) {
    } finally {
      bottomSheetModalRef.current?.close();
      setGroupname('');
      setGroupdescription('');
      // getUserGroups();
    }
  }

  async function joinBibleStudy() {
    if (!groupCode) {
      return;
    }
    try {
      let { data: study_group, error } = await supabase
        .from('study_group')
        .select('*')
        .eq('code', groupCode)
        .single();

      if (!study_group) {
        alert("This group doesn't exist. Try again");
        return;
      }
      const { data: insertMemberData, error: insertMemberError } = await supabase
        .from('group_members')
        .insert([
          {
            group_id: study_group.id,
            user_id: currentUser?.id,
            is_admin: false,
          },
        ])
        .select();
    } catch (error) {
      console.log('something went wrong: ', error);
    } finally {
      bottomSheetModalRef.current?.close();
      setGroupCode(null);
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
          <View className="mb-3 flex-row gap-4 rounded-lg bg-gray-200 p-2">
            <Pressable
              onPress={() => setActiveTab('create')}
              style={{ backgroundColor: activeTab === 'create' ? 'white' : '' }}
              className="flex-1 items-center justify-center rounded-md bg-light-secondary  p-2">
              <Text className="font-bold">CREATE</Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab('join')}
              style={{ backgroundColor: activeTab === 'join' ? 'white' : '' }}
              className="flex-1 items-center justify-center rounded-md p-2">
              <Text className="font-bold">JOIN</Text>
            </Pressable>
          </View>
          {activeTab === 'create' ? (
            <View>
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
                  className="mt-1 items-center justify-center rounded-3xl bg-light-primary p-4">
                  <Text className="text-lg font-bold">CREATE</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View>
              <View className="flex-row items-center gap-3">
                <FontAwesome5 name="bible" size={24} color="black" />
                <Text className="text-lg font-medium">Join Bible study group</Text>
              </View>
              <View className="mt-4 gap-3">
                <TextInput
                  value={groupdescription}
                  onChangeText={setGroupdescription}
                  placeholder="Enter group code"
                  className="rounded-3xl bg-gray-200 p-4 placeholder:text-light-foreground/60"
                  //   style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
                />

                <Pressable
                  onPress={joinBibleStudy}
                  className="mt-1 items-center justify-center rounded-3xl bg-light-primary p-4">
                  <Text className="text-lg font-bold">JOIN</Text>
                </Pressable>
              </View>
            </View>
          )}
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
    gap: 10,
    padding: 10,
  },
});

export default CreateGroupBottomModal;
