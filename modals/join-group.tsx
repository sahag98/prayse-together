import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Button, Pressable, TextInput, Share } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModal, BottomSheetView, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Feather } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '~/utils/supabase';
import { router } from 'expo-router';
import { useTheme } from '~/providers/theme-provider';
const JoinGroupModal = ({
  code,
  bottomSheetModalRef,
}: {
  code: number;
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
}) => {
  const { colorScheme } = useTheme();
  // ref
  const snapPoints = useMemo(() => ['30%'], []);
  // callbacks

  const handleSheetChanges = useCallback((index: number) => {
    // console.log('handleSheetChanges', index);
  }, []);

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
        handleStyle={{
          backgroundColor: colorScheme === 'dark' ? '#212121' : 'white',
          borderTopEndRadius: 15,
          borderTopLeftRadius: 15,
        }}
        handleIndicatorStyle={{ backgroundColor: colorScheme === 'dark' ? 'white' : 'black' }}
        ref={bottomSheetModalRef}
        snapPoints={snapPoints}
        index={1}
        onChange={handleSheetChanges}>
        <BottomSheetView className="bg-card" style={styles.contentContainer}>
          <View className="flex-1 items-center justify-center gap-3 p-2">
            <Text className="font-nunito-medium text-xl text-foreground sm:text-2xl">
              Share this code with someone and invite them to this study!
            </Text>
            <Pressable className="flex-row items-center gap-0 p-3">
              <Text className="font-nunito-semibold text-4xl text-foreground sm:text-5xl">#</Text>
              <Text className="rounded-xl p-3 font-nunito-bold text-4xl text-foreground sm:text-5xl">
                {code}
              </Text>
            </Pressable>
            <View className="mt-auto gap-3">
              <Pressable
                onPress={shareGroup}
                className=" w-full flex-row items-center justify-between gap-3 rounded-lg bg-secondary p-4">
                <Text className="font-nunito-semibold text-xl sm:text-2xl">Share code</Text>
                <Feather name="share" size={24} color="black" />
              </Pressable>
            </View>
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

export default JoinGroupModal;
