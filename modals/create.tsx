import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Button, Pressable } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';

import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { supabase } from '~/utils/supabase';
import { Tables } from '~/database.types';
import { useAuth } from '~/providers/auth-provider';
import { useQueryClient } from '@tanstack/react-query';
import { Feather } from '@expo/vector-icons';

const InputComponent = ({ value, setValue }: { value: string; setValue: any }) => {
  const [title, setTitle] = useState('');
  return (
    <BottomSheetTextInput
      style={{
        borderBottomWidth: 1,
      }}
      placeholder="Title"
      value={value}
      className="rounded-3xl bg-gray-200 p-4 placeholder:text-light-foreground/60"
      onChangeText={setValue}
    />
  );
};

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
  const [groupCode, setGroupCode] = useState<any | null>();
  const [activeTab, setActiveTab] = useState('create');
  const queryClient = useQueryClient();
  const { getUserGroups } = useAuth();
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);
  // ref
  const snapPoints = useMemo(() => ['25%', '50%'], []);
  // callbacks

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  async function finalizeSetup() {
    if (!groupname) {
      console.log('no name');
      return;
    }
    const randomCode = Math.floor(100000 + Math.random() * 900000);

    try {
      // Generate a random 6-digit number
      const { data, error } = await supabase
        .from('study_group')
        .insert([
          {
            name: groupname,
            code: randomCode,
            // study_time: date.toISOString(),
            // frequency: groupFrequency,
            admin_id: currentUser?.id,
          },
        ])
        .select();

      if (error) console.log(error);

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
      bottomSheetModalRef.current?.close();
      setGroupname('');
      setGroupdescription('');
      queryClient.invalidateQueries({
        queryKey: ['groups'],
      });
    } catch (error) {
      console.log(error);
    }
  }

  const onChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate;
    // setShow(false);
    setDate(currentDate);
  };

  const showMode = (currentMode: string) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };

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
      // getUserGroups();
      bottomSheetModalRef.current?.close();
      setGroupCode(null);
      queryClient.invalidateQueries({
        queryKey: ['groups'],
      });
      setActiveTab('create');
    }
  }

  // renders
  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        containerStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        snapPoints={snapPoints}
        index={2}
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
                <Text className="text-xl font-medium">Create Bible study group</Text>
              </View>
              <View className="mt-4 gap-4">
                {/* <InputComponent value={groupname} setValue={setGroupname} /> */}
                <BottomSheetTextInput
                  defaultValue={groupname}
                  onChangeText={setGroupname}
                  placeholder="Enter group name"
                  className="rounded-xl bg-gray-200 p-4 placeholder:text-light-foreground/60"
                  //   style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
                />

                {/* SAVING THIS FOR THE FIRST APP UPDATE */}
                {/* <View className="gap-3">
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
                  onPress={() => setShow((prev) => !prev)}
                  className="flex-row items-center justify-between rounded-xl">
                  <Text className="text-lg font-medium">Set Date and Time</Text>
                  <View className="size-7 items-center justify-center rounded-lg border border-light-foreground">
                    {show && <Feather name="check" size={20} color="black" />}
                  </View>
                </Pressable>

                {show && (
                  <View className="flex-row items-center">
                    <DateTimePicker
                      testID="dateTimePickerDate"
                      value={date}
                      mode={'date'}
                      is24Hour={true}
                      onChange={onChange}
                    />
                    <DateTimePicker
                      testID="dateTimePickerTime"
                      value={date}
                      mode={'time'}
                      is24Hour={true}
                      onChange={onChange}
                    />
                  </View>
                )} */}
                <Pressable
                  disabled={!groupname}
                  onPress={finalizeSetup}
                  className={
                    !groupname
                      ? 'mt-1 items-center justify-center rounded-3xl bg-light-primary p-4 opacity-40'
                      : 'mt-1 items-center justify-center rounded-3xl bg-light-primary p-4'
                  }>
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
                <BottomSheetTextInput
                  defaultValue={groupCode}
                  onChangeText={setGroupCode}
                  placeholder="Enter group code"
                  keyboardType="numeric"
                  className="rounded-3xl bg-gray-200 p-4 placeholder:text-light-foreground/60"
                  //   style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
                />

                <Pressable
                  disabled={!groupCode}
                  onPress={joinBibleStudy}
                  className={
                    !groupCode
                      ? 'mt-1 items-center justify-center rounded-3xl bg-light-primary p-4 opacity-40'
                      : 'mt-1 items-center justify-center rounded-3xl bg-light-primary p-4'
                  }>
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
