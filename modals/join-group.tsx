import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Button, Pressable, TextInput } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModal, BottomSheetView, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Feather } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '~/utils/supabase';
import { router } from 'expo-router';
const JoinGroupModal = ({
  code,
  bottomSheetModalRef,
}: {
  code: number;
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
}) => {
  // ref
  const snapPoints = useMemo(() => ['50%'], []);
  // callbacks

  const handleSheetChanges = useCallback((index: number) => {
    // console.log('handleSheetChanges', index);
  }, []);

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
          <View className="flex-1 items-center justify-center gap-3 p-2">
            <Text className="text-xl font-medium">
              Share this code with someone and invite them to this study!
            </Text>
            <Pressable className="flex-row items-center gap-2 p-3">
              <Text className="text-4xl">#</Text>
              <Text className="rounded-xl bg-light-primary p-3 text-4xl font-bold">{code}</Text>
            </Pressable>
            <Pressable className="mt-auto w-full flex-row items-center justify-between gap-3 rounded-lg bg-light-secondary p-4">
              <Text className="text-xl font-semibold">Share app</Text>
              <Feather name="share" size={24} color="black" />
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

export default JoinGroupModal;
