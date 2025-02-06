import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Container } from '~/components/Container';
import { useAuth } from '~/providers/auth-provider';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '~/utils/supabase';
import { Tables } from '~/database.types';
import { AntDesign, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import JoinGroupModal from '~/modals/join-group';
import { GroupMembers, Note } from '~/types/types';
import { useUserStore } from '~/store/store';
import uuid from 'react-native-uuid';
import { useTheme } from '~/providers/theme-provider';
const EndScreen = () => {
  const { colorScheme } = useTheme();
  const { currentUser } = useAuth();
  const { saveNotes } = useUserStore();
  const { id } = useLocalSearchParams();
  const [isSaving, setIsSaving] = useState(false);
  const [groupNotes, setGroupNotes] = useState<Note[] | null>();
  const [currentGroup, setCurrentGroup] = useState<Tables<'study_group'> | null>();

  const [hasAlreadySaved, setHasAlreadySaved] = useState(false);

  useEffect(() => {
    getStudyNotes();
  }, [id]);

  async function getGroup() {
    const { data, error } = await supabase.from('study_group').select('*').eq('id', id).single();

    return data;
  }

  async function getStudyNotes() {
    const { data, error } = await supabase
      .from('group_notes')
      .select('*, profiles(username,avatar_url)')
      .eq('group_id', id);

    if (data) {
      //@ts-expect-error
      setGroupNotes(data);
    }
  }

  async function endStudy() {
    console.log('ending study: ', hasAlreadySaved);

    if (hasAlreadySaved) {
      router.push('/(app)/(tabs)');
      deleteNotes();
      return;
    }

    if (groupNotes && groupNotes?.length > 0) {
      Alert.alert(
        'Leave Study',
        'Leaving the study will delete the notes for this study. Before leaving, make sure to save if you would like to keep them.',
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          { text: 'Leave', onPress: deleteNotes },
        ]
      );
    } else {
      router.push('/(app)/(tabs)');
    }
  }

  async function deleteNotes() {
    const { data, error } = await supabase.from('group_notes').delete().eq('group_id', id);
    router.push('/(app)/(tabs)');
  }

  async function saveStudyNotes() {
    console.log('saving...');
    setHasAlreadySaved(true);

    if (groupNotes) {
      const date = new Date().toDateString();
      const group = await getGroup();
      let noteWithId = {
        id: uuid.v4(),
        creationDate: date,
        groupName: group?.name!,
        data: groupNotes,
      };

      saveNotes(noteWithId);
    }
  }

  return (
    <Container>
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <Pressable onPress={endStudy}>
              <AntDesign name="left" size={24} color={colorScheme === 'dark' ? 'white' : 'black'} />
            </Pressable>
          </View>
        </View>
        <View className="flex-1 items-center justify-center gap-1">
          <Entypo name="open-book" size={80} color={colorScheme === 'dark' ? 'white' : 'black'} />
          <Text className="font-nunito-semibold text-xl text-foreground sm:text-2xl">
            The study has ended.
          </Text>
          {groupNotes && groupNotes?.length > 0 && !hasAlreadySaved && (
            <Pressable onPress={saveStudyNotes} className="mt-4 rounded-xl bg-primary p-4">
              <Text className="font-nunito-bold text-lg sm:text-xl">Save Study Notes</Text>
            </Pressable>
          )}

          <Pressable onPress={endStudy} className="mt-10 rounded-xl  p-4">
            <Text className="font-nunito-semibold text-sm text-foreground underline sm:text-lg">
              Back to Home
            </Text>
          </Pressable>
        </View>
      </View>
    </Container>
  );
};

export default EndScreen;

const styles = StyleSheet.create({});
