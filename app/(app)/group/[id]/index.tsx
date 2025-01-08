import { Pressable, Text, View, TextInput, FlatList, Alert } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Container } from '~/components/Container';
import { supabase } from '~/utils/supabase';
import { Tables } from '~/database.types';

import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '~/providers/auth-provider';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import JoinGroupModal from '~/modals/join-group';

import GetVerseModal from '~/modals/get-verse-modal';
import { Note } from '~/types/types';
import NoteItem from '~/components/NoteItem';
import InsertTextModlal from '~/modals/insert-text-modal';

const GroupPage = () => {
  const { id } = useLocalSearchParams();
  const inputRef = useRef<TextInput>(null);
  const joinModalRef = useRef<BottomSheetModal>(null);
  const [showVerseModal, setShowVerseModal] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);

  const { currentUser } = useAuth();

  const [currentGroup, setCurrentGroup] = useState<Tables<'study_group'> | null>();
  const [groupNotes, setGroupNotes] = useState<Note[] | null>();
  // callbacks
  const handlePresentJoinModalPress = useCallback(() => {
    joinModalRef.current?.present();
  }, []);

  async function getGroup() {
    const { data: study_group, error } = await supabase
      .from('study_group')
      .select('*')
      .eq('id', id);

    if (study_group) {
      setCurrentGroup(study_group[0]);
    }
  }

  async function getGroupNote() {
    const { data, error } = await supabase
      .from('group_notes')
      .select('*, profiles(username,avatar_url)')
      .eq('group_id', id);
    //@ts-expect-error
    setGroupNotes(data);
  }

  async function endBibleStudy() {
    const { data, error } = await supabase
      .from('study_group')
      .update({ has_started: false })
      .eq('id', id)
      .select();
  }

  // async function updateNote() {
  //   if (note === initialNote) return; // No changes to save

  //   const { data: existingNote, error: fetchError } = await supabase
  //     .from('group_notes')
  //     .select('*')
  //     .eq('group_id', id)
  //     .single();

  //   if (fetchError && fetchError.code !== 'PGRST116') {
  //     console.error('Error fetching existing note:', fetchError);
  //     return;
  //   }

  //   if (existingNote) {
  //     const { error: updateError } = await supabase
  //       .from('group_notes')
  //       .update({ note })
  //       .eq('group_id', id);

  //     if (updateError) {
  //       console.error('Error updating note:', updateError);
  //       return;
  //     }
  //   } else {
  //     const { data: noteData, error: insertError } = await supabase
  //       .from('group_notes')
  //       .insert({ group_id: Number(id), note })
  //       .select()
  //       .single();

  //     if (insertError) {
  //       console.error('Error inserting note:', insertError);
  //       return;
  //     }

  //     const { error } = await supabase
  //       .from('study_group')
  //       .update({ note_id: noteData.id })
  //       .eq('id', id);

  //     console.log('update group note error: ', error);

  //     if (insertError) {
  //       console.error('Error inserting note:', insertError);
  //       return;
  //     }
  //   }

  //   setInitialNote(note);
  // }

  // // Call the function
  // getBibleVerse();

  useEffect(() => {
    getGroup();
    getGroupNote();

    // Set up real-time subscription
    const channel = supabase
      .channel('group')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'group_notes', filter: `group_id=eq.${id}` },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            console.log('should UPDATE: ', payload.new);

            const newNote = payload.new;

            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', newNote.user_id)
              .single();

            console.log('new note: ', newNote);

            const noteWithProfile = {
              ...newNote,
              profiles: {
                avatar_url: profile?.avatar_url,
                username: profile?.username,
              },
            };
            //@ts-expect-error
            setGroupNotes((prev) => [...prev, noteWithProfile]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'study_group', filter: `id=eq.${id}` },
        (payload) => {
          console.log('new!!');
          if (payload.eventType === 'UPDATE') {
            if (payload.new.has_started === true) {
              console.log('STUDY IS STARTING: ', payload.new);
              // router.push(`/group/${id}`);
              setCurrentGroup((prev: any) => ({
                ...prev,
                has_started: true,
              }));
            } else if (!payload.new.has_started) {
              console.log('STUDY IS ENDING: ', payload.new);
              setCurrentGroup((prev: any) => ({
                ...prev,
                has_started: false,
              }));
              router.push(`/group/${id}/end`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel); // Clean up the subscription
    };
  }, [id]);

  if (!currentGroup) return;

  if (!currentGroup.has_started && currentGroup.admin_id === currentUser?.id) {
    return <Redirect href={`/group/${id}/start`} />;
  }

  if (!currentGroup.has_started) {
    return (
      <Container>
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={() => {
                  router.push('/(app)/(tabs)');
                }}>
                <AntDesign name="left" size={24} color="black" />
              </Pressable>
              <Text className="text-3xl font-bold">{currentGroup?.name}</Text>
            </View>
          </View>
          <View className="flex-1 items-center justify-center gap-2">
            <MaterialCommunityIcons
              className="animate-spin"
              name="loading"
              size={70}
              color="#FFD700"
            />
            <Text className="w-4/5  text-center font-medium">
              Please wait for the admin to start the study.
            </Text>
          </View>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <View className="flex-1">
        <View className="flex-row items-center justify-between gap-4">
          <View className="flex-1 flex-row items-center gap-2">
            <Pressable
              onPress={() => {
                router.back();
              }}>
              <AntDesign name="left" size={24} color="black" />
            </Pressable>
            <Text className="text-3xl font-bold">{currentGroup?.name}</Text>
          </View>
          {currentGroup.has_started && currentUser?.id === currentGroup.admin_id && (
            <>
              <Pressable onPress={handlePresentJoinModalPress} className="p-2">
                <AntDesign name="addusergroup" size={30} color="black" />
              </Pressable>
              <Pressable
                onPress={() =>
                  Alert.alert(
                    'End Bible Study',
                    'This action will end the current study for everyone.',
                    [
                      {
                        text: 'Cancel',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                      },
                      { text: 'End', style: 'destructive', onPress: endBibleStudy },
                    ]
                  )
                }
                className="rounded-xl border border-red-400 bg-red-100 px-4 py-2">
                <Text className="text-lg font-bold text-red-500">END</Text>
              </Pressable>
            </>
          )}
        </View>
        <FlatList
          data={groupNotes?.toReversed()}
          inverted
          style={{ marginBottom: 5, flex: 1, marginTop: 15 }}
          contentContainerStyle={{ gap: 15 }}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item?.id?.toString()}
          renderItem={({ item }) => <NoteItem item={item} />}
        />
        {currentGroup.has_started && (
          <View className="mb-8 mt-auto flex-row justify-between gap-4 pt-2">
            <Pressable
              onPress={() => setShowVerseModal(true)}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-light-primary bg-light-primary/15 p-3">
              <Text className="text-lg font-medium">Bible Verse</Text>
              <AntDesign name="plus" size={15} color="black" />
            </Pressable>
            <Pressable
              onPress={() => setShowTextModal(true)}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-light-secondary bg-light-secondary/15 p-3">
              <Text className="text-lg font-medium">Text</Text>
              <AntDesign name="plus" size={15} color="black" />
            </Pressable>
          </View>
        )}
      </View>

      <JoinGroupModal code={currentGroup?.code} bottomSheetModalRef={joinModalRef} />
      <GetVerseModal groupId={id} visible={showVerseModal} setVisible={setShowVerseModal} />
      <InsertTextModlal groupId={id} visible={showTextModal} setVisible={setShowTextModal} />
    </Container>
  );
};

export default GroupPage;
