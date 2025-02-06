import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { Feather } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '~/utils/supabase';
import { Link, router } from 'expo-router';
import { useAuth } from '~/providers/auth-provider';
import { useTheme } from '~/providers/theme-provider';
import { useUserStore } from '~/store/store';
import { emojies } from '~/constants/Emojis';
const CreateBottomModal = ({
  bottomSheetModalRef,
  updateProfile,
}: {
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
  updateProfile: () => void;
}) => {
  const { colorScheme } = useTheme();
  const { selectedEmoji, fetchStudies, setSelectedEmoji } = useUserStore();
  const { currentUser } = useAuth();
  const [groupname, setGroupname] = useState('');
  const [groupdescription, setGroupdescription] = useState('');
  const [groupFrequency, setGroupFrequency] = useState('');
  const [isFinalizing, setIsFinalizing] = useState(false);
  // ref
  const snapPoints = useMemo(() => ['25%', '50%'], []);
  // callbacks

  useEffect(() => {
    setSelectedEmoji(emojies[Math.floor(Math.random() * emojies.length)]);

    return () => {
      setSelectedEmoji('');
    };
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  async function finalizeSetup() {
    setIsFinalizing(true);
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    try {
      // Generate a random 6-digit number
      const { data, error } = await supabase
        .from('study_group')
        .insert([
          {
            name: `${groupname} ${selectedEmoji}`,
            description: groupdescription,
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
      console.log('group info:', data[0].id);
      fetchStudies(currentUser?.id!);
    } catch (error) {
    } finally {
      updateProfile();
      setIsFinalizing(false);
      // router.push(`/(app)/(tabs)`);
    }
  }

  // renders
  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        backgroundStyle={{ backgroundColor: colorScheme === 'dark' ? '#212121' : 'white' }}
        snapPoints={snapPoints}
        handleIndicatorStyle={{ backgroundColor: colorScheme === 'dark' ? '#787878' : 'black' }}
        handleStyle={{
          backgroundColor: colorScheme === 'dark' ? '#212121' : 'white',
        }}
        containerStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        index={2}
        onChange={handleSheetChanges}>
        <BottomSheetView style={styles.contentContainer}>
          <View className="flex-row items-center gap-3">
            <FontAwesome5
              name="bible"
              size={24}
              color={colorScheme === 'dark' ? 'white' : 'black'}
            />
            <Text className="font-nunito-medium text-xl text-foreground sm:text-2xl">
              Create Bible Study
            </Text>
          </View>
          <View className="mt-4 gap-3">
            <View className="flex-row items-center justify-between gap-5">
              <BottomSheetTextInput
                defaultValue={groupname}
                onChangeText={setGroupname}
                selectionColor={colorScheme === 'dark' ? 'white' : 'black'}
                placeholder="What's the name of this study?"
                placeholderTextColor={colorScheme === 'dark' ? '#dcdcdc' : '#4b5563'}
                className="flex-1 rounded-xl bg-input p-4 font-nunito-medium text-foreground"
                //   style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
              />
              <Link href={{ pathname: '/emoji-picker' }}>
                <View className="size-12 items-center justify-center rounded-full bg-input">
                  <Text>{selectedEmoji}</Text>
                </View>
              </Link>
            </View>
            <BottomSheetTextInput
              defaultValue={groupdescription}
              onChangeText={setGroupdescription}
              selectionColor={colorScheme === 'dark' ? 'white' : 'black'}
              placeholder="What's the description of this study?"
              placeholderTextColor={colorScheme === 'dark' ? '#dcdcdc' : '#4b5563'}
              className="rounded-xl bg-input p-4 font-nunito-medium text-foreground"
              //   style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
            />
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
              </View> */}
            <Pressable
              disabled={isFinalizing}
              onPress={finalizeSetup}
              className="mt-4 items-center justify-center rounded-3xl bg-primary p-4">
              {isFinalizing ? (
                <ActivityIndicator />
              ) : (
                <Text className="font-nunito-semibold  text-base sm:text-lg">Create</Text>
              )}
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
