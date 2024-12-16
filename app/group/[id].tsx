import { Pressable, Text, View, TextInput, FlatList } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Container } from '~/components/Container';
import { supabase } from '~/utils/supabase';
import { Tables } from '~/database.types';
import { AntDesign } from '@expo/vector-icons';
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
  const [initialNote, setInitialNote] = useState<string>('');
  const [showDone, setShowDone] = useState(false);

  // type Verse = string;

  // type Chapter = Verse[];

  // interface Book {
  //   name: string; // Name of the book (e.g., "Genesis")
  //   chapters: Chapter[]; // Array of chapters, each chapter is an array of verses
  // }

  // const bible: Book[] = biblejson;
  // console.log('BIBLE: ', JSON.stringify(bible[0].chapters[0][0], null, 2));

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
      .eq('group_id', id)
      .order('id', { ascending: false });
    //@ts-expect-error
    setGroupNotes(data);
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
      .channel('group_notes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'group_notes', filter: `group_id=eq.${id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            console.log('should UPDATE: ', payload.new);

            const newNote = payload.new;

            const noteWithProfile = {
              ...newNote,
              profiles: {
                avatar_url: currentUser?.avatar_url,
                username: currentUser?.username,
              },
            };
            //@ts-expect-error
            setGroupNotes((prev) => [noteWithProfile, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel); // Clean up the subscription
    };
  }, [id]);

  if (!currentGroup) return;

  return (
    <Container>
      <View className="flex-1 px-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <Pressable
              onPress={() => {
                if (showDone) {
                  //updateNote();
                }
                router.push('/(tabs)/home');
              }}>
              <AntDesign name="left" size={24} color="black" />
            </Pressable>
            <Text className="text-2xl font-bold">{currentGroup?.name}</Text>
          </View>
          <Pressable onPress={handlePresentJoinModalPress} className="p-2">
            <AntDesign name="addusergroup" size={30} color="black" />
          </Pressable>
        </View>
        <FlatList
          data={groupNotes}
          inverted
          style={{ marginBottom: 5, flex: 1, marginTop: 15 }}
          contentContainerStyle={{ gap: 15 }}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item?.id?.toString()}
          renderItem={({ item }) => <NoteItem item={item} />}
        />
        <View className="mb-4 mt-auto flex-row justify-between gap-4 pt-2">
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
      </View>

      <JoinGroupModal code={currentGroup?.code} bottomSheetModalRef={joinModalRef} />
      <GetVerseModal groupId={id} visible={showVerseModal} setVisible={setShowVerseModal} />
      <InsertTextModlal groupId={id} visible={showTextModal} setVisible={setShowTextModal} />
    </Container>
  );
};

export default GroupPage;
