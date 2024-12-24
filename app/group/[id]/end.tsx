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
const EndScreen = () => {
  const { currentUser } = useAuth();
  const { saveNotes } = useUserStore();
  const { id } = useLocalSearchParams();
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
    console.log('ending study');

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
      router.push('/(tabs)/home');
    }
  }

  async function deleteNotes() {
    const { data, error } = await supabase.from('group_notes').delete().eq('group_id', id);
    router.push('/(tabs)/home');
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
      console.log('notewithId:', JSON.stringify(noteWithId, null, 2));
      saveNotes(noteWithId);
    }
  }

  return (
    <Container>
      <View className="flex-1 px-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <Pressable onPress={endStudy}>
              <AntDesign name="left" size={24} color="black" />
            </Pressable>
          </View>
        </View>
        <View className="flex-1 items-center justify-center gap-1">
          <Entypo name="open-book" size={80} color="black" />
          <Text className="text-xl font-semibold">The study has ended.</Text>
          {groupNotes?.length! > 0 && (
            <Pressable onPress={saveStudyNotes} className="mt-4 rounded-xl bg-light-primary p-4">
              <Text className="font-bold">Save study notes</Text>
            </Pressable>
          )}

          <Pressable onPress={endStudy} className="mt-10 rounded-xl  p-4">
            <Text className="text-sm font-semibold underline">Back to Home</Text>
          </Pressable>
        </View>
      </View>
    </Container>
  );
};

export default EndScreen;

const styles = StyleSheet.create({});
