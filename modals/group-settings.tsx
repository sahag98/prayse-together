import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Share, Alert } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { AntDesign, FontAwesome6, Ionicons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { supabase } from '~/utils/supabase';
import { router } from 'expo-router';
import { GroupMembers } from '~/types/types';
const GroupSettingsModal = ({
  group_id,
  created,
  admin,
  code,
  bottomSheetModalRef,
}: {
  group_id: number | undefined;
  created: string;
  admin: GroupMembers;
  code: number;
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
}) => {
  // ref
  const snapPoints = useMemo(() => ['30%'], []);
  // callbacks

  const handleSheetChanges = useCallback((index: number) => {
    // console.log('handleSheetChanges', index);
  }, []);

  async function deleteStudy() {
    console.log('deleting');

    if (!group_id) return;
    await supabase.from('study_group').delete().eq('id', group_id);
    bottomSheetModalRef.current?.dismiss();
    router.back();
  }

  async function shareGroup() {
    await Share.share({
      title: `Hey! Join my bible study group 📖`,
      message: `Hey! Join my bible study group 📖 \n Use this code to join: ${code} if you are approved for testing. \n If not, reach out to @sahag98 on Instagram so that he can add you to the testing!`,
    });
    // Linking.openURL(`market://details?id=${config.androidPackageName}`);

    // Linking.openURL(`itms-apps://itunes.apple.com/app/id${config.iosItemId}`);
  }

  // renders
  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        containerStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        ref={bottomSheetModalRef}
        snapPoints={snapPoints}
        index={1}
        onChange={handleSheetChanges}>
        <BottomSheetView style={styles.contentContainer}>
          <View className="flex-1 gap-5 p-2">
            <View className="flex-row items-center gap-2">
              <Ionicons name="information-circle-outline" size={24} color="black" />
              <Text className="text-2xl font-bold">Bible Study Info</Text>
            </View>
            <View className="gap-3">
              <View className="flex-row items-center gap-3">
                <AntDesign name="calendar" size={24} color="#858484" />
                <Text className="text-lg text-light-foreground/75">
                  Created:{' '}
                  <Text className="text-light-foreground">{new Date(created).toDateString()}</Text>
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <FontAwesome5 name="user-circle" size={24} color="#858484" />
                <Text className="text-lg text-light-foreground/75">
                  Admin: <Text className="text-light-foreground">{admin.profiles.username}</Text>
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => {
                Alert.alert(
                  'Delete Bible Study',
                  'This action will permenantly delete this bible study for all group members.',
                  [
                    {
                      text: 'Cancel',
                      onPress: () => console.log('Cancel Pressed'),
                      style: 'cancel',
                    },
                    { text: 'Delete', style: 'destructive', onPress: deleteStudy },
                  ]
                );
              }}
              className="mt-auto flex-row items-center justify-between rounded-xl bg-red-100 p-4">
              <Text className="text-lg font-semibold text-red-600">Delete</Text>
              <FontAwesome6 name="trash-alt" size={25} color="#ff4d4d" />
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
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 30,
  },
});

export default GroupSettingsModal;
