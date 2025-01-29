import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { emojies } from '~/constants/Emojis';
import { useTheme } from '~/providers/theme-provider';

const InputComponent = ({ value, setValue }: { value: string; setValue: any }) => {
  const [title, setTitle] = useState('');
  return (
    <BottomSheetTextInput
      style={{
        borderBottomWidth: 1,
      }}
      placeholder="Title"
      value={value}
      className="placeholder:text-light-foreground/60 rounded-3xl bg-gray-200 p-4"
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
  const { colorScheme } = useTheme();

  const [groupname, setGroupname] = useState('');
  const [groupdescription, setGroupdescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('');
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

  useEffect(() => {
    setSelectedEmoji(emojies[Math.floor(Math.random() * emojies.length)]);

    return () => {
      setSelectedEmoji('');
    };
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
            name: `${groupname} ${selectedEmoji}`,
            code: randomCode,
            description: groupdescription,
            // study_time: date.toISOString(),
            // frequency: groupFrequency,
            admin_id: currentUser?.id,
          },
        ])
        .select();

      if (error) console.log(error);

      if (!data) return;

      bottomSheetModalRef.current?.close();
      setGroupname('');
      setGroupdescription('');
      queryClient.invalidateQueries({
        queryKey: ['groups'],
      });

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
  console.log(activeTab);

  // renders
  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        containerStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        handleIndicatorStyle={{ backgroundColor: colorScheme === 'dark' ? '#787878' : 'black' }}
        handleStyle={{
          backgroundColor: colorScheme === 'dark' ? '#212121' : 'white',
          borderTopEndRadius: 15,
          borderTopLeftRadius: 15,
        }}
        snapPoints={snapPoints}
        index={2}
        onChange={handleSheetChanges}>
        <BottomSheetView className="bg-card" style={styles.contentContainer}>
          <View className="mb-3 flex-row gap-4 rounded-lg border border-cardborder bg-card p-2">
            <Pressable
              onPress={() => setActiveTab('create')}
              style={{ backgroundColor: activeTab === 'create' ? '#87ceeb' : '' }}
              className="flex-1 items-center justify-center rounded-md bg-secondary  p-3">
              <Text
                style={{ color: activeTab === 'create' ? 'black' : 'white' }}
                className="font-bold">
                CREATE
              </Text>
            </Pressable>
            <View className="h-full w-0.5 bg-background dark:bg-input" />
            <Pressable
              onPress={() => setActiveTab('join')}
              style={{ backgroundColor: activeTab === 'join' ? '#87ceeb' : '' }}
              className="flex-1 items-center  justify-center rounded-md p-2">
              <Text
                style={{ color: activeTab === 'join' ? 'black' : 'white' }}
                className="font-bold text-foreground">
                JOIN
              </Text>
            </Pressable>
          </View>
          {activeTab === 'create' ? (
            <View>
              <View className="gap-4">
                {/* <InputComponent value={groupname} setValue={setGroupname} /> */}
                <View className="flex-row items-center justify-between gap-5">
                  <BottomSheetTextInput
                    defaultValue={groupname}
                    onChangeText={setGroupname}
                    selectionColor={colorScheme === 'dark' ? 'white' : 'black'}
                    placeholder="What's the title of this study?"
                    className="flex-1 rounded-xl bg-input p-4 text-foreground placeholder:text-input_placeholder"
                    //   style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
                  />

                  <Pressable className="size-12 items-center justify-center rounded-full bg-input">
                    <Text>{selectedEmoji}</Text>
                  </Pressable>
                </View>
                <BottomSheetTextInput
                  defaultValue={groupdescription}
                  onChangeText={setGroupdescription}
                  selectionColor={colorScheme === 'dark' ? 'white' : 'black'}
                  placeholder="What's the description of this study?"
                  className="rounded-xl bg-input p-4 text-foreground placeholder:text-input_placeholder"
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
                          : 'flex-1 items-center justify-center rounded-xl bg-input p-6'
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
                      ? 'mt-1 items-center justify-center rounded-3xl bg-primary p-4 opacity-40'
                      : 'mt-1 items-center justify-center rounded-3xl bg-primary p-4'
                  }>
                  <Text className="text-lg font-bold">CREATE</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View>
              <View className="gap-3">
                <BottomSheetTextInput
                  defaultValue={groupCode}
                  onChangeText={setGroupCode}
                  placeholder="Enter group code"
                  keyboardType="numeric"
                  className="rounded-3xl bg-input p-4 placeholder:text-input_placeholder"
                  //   style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
                />

                <Pressable
                  disabled={!groupCode}
                  onPress={joinBibleStudy}
                  className={
                    !groupCode
                      ? 'mt-1 items-center justify-center rounded-3xl bg-primary p-4 opacity-40'
                      : 'mt-1 items-center justify-center rounded-3xl bg-primary p-4'
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
