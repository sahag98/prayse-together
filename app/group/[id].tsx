import { Pressable, Text, View, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Container } from '~/components/Container';
import { supabase } from '~/utils/supabase';
import { Tables } from '~/database.types';
import { AntDesign, Entypo, Feather } from '@expo/vector-icons';
import { useAuth } from '~/providers/auth-provider';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import JoinGroupModal from '~/modals/join-group';

const GroupPage = () => {
  const { id } = useLocalSearchParams();
  const inputRef = useRef<TextInput>(null);
  const joinModalRef = useRef<BottomSheetModal>(null);

  const { currentUser } = useAuth();

  const [currentGroup, setCurrentGroup] = useState<Tables<'study_group'> | null>();
  const [note, setNote] = useState<string>('');
  const [initialNote, setInitialNote] = useState<string>('');
  const [showDone, setShowDone] = useState(false);

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
      .select('*')
      .eq('group_id', id)
      .single();

    if (data) {
      setNote(data.note || '');
      setInitialNote(data.note || '');
    }
  }

  async function updateNote() {
    if (note === initialNote) return; // No changes to save

    const { data: existingNote, error: fetchError } = await supabase
      .from('group_notes')
      .select('*')
      .eq('group_id', id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching existing note:', fetchError);
      return;
    }

    if (existingNote) {
      const { error: updateError } = await supabase
        .from('group_notes')
        .update({ note })
        .eq('group_id', id);

      if (updateError) {
        console.error('Error updating note:', updateError);
        return;
      }
    } else {
      const { data: noteData, error: insertError } = await supabase
        .from('group_notes')
        .insert({ group_id: Number(id), note })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting note:', insertError);
        return;
      }

      const { error } = await supabase
        .from('study_group')
        .update({ note_id: noteData.id })
        .eq('id', id);

      console.log('update group note error: ', error);

      if (insertError) {
        console.error('Error inserting note:', insertError);
        return;
      }
    }

    setInitialNote(note);
  }

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
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            console.log('should UPDATE');
            const updatedNote = payload.new.note;
            setNote(updatedNote);
            setInitialNote(updatedNote);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel); // Clean up the subscription
    };
  }, [id]);

  useEffect(() => {
    setShowDone(note !== initialNote);
  }, [note]);

  if (!currentGroup) return;

  return (
    <Container>
      <View className="flex-1 px-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <Pressable
              onPress={() => {
                if (showDone) {
                  updateNote();
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
          {showDone && (
            <Pressable onPress={updateNote}>
              <Text className="text-xl font-bold text-yellow-500">Done</Text>
            </Pressable>
          )}
        </View>
        <View className="mb-4 mt-auto gap-2">
          <Pressable className="flex-row items-center gap-2 self-start rounded-2xl border border-light-secondary bg-light-secondary/15 p-3">
            <Text className="text-base font-medium">Bible Verse</Text>
            <AntDesign name="plus" size={15} color="black" />
          </Pressable>
          <Pressable className="flex-row items-center gap-2 self-start rounded-2xl border border-light-accent bg-light-accent/15 p-3">
            <Text className="text-base font-medium">Text</Text>
            <AntDesign name="plus" size={15} color="black" />
          </Pressable>
        </View>
      </View>

      <JoinGroupModal code={currentGroup?.code} bottomSheetModalRef={joinModalRef} />
    </Container>
  );
};

export default GroupPage;
