import {
  View,
  Text,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Pressable,
} from 'react-native';
import React, { useState } from 'react';
import { AntDesign } from '@expo/vector-icons';
import { supabase } from '~/utils/supabase';
import { useAuth } from '~/providers/auth-provider';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useTheme } from '~/providers/theme-provider';

const InsertTextModal = ({
  channel,
  groupId,
  visible,
  setVisible,
}: {
  channel: RealtimeChannel | undefined;
  groupId: string | string[];
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { colorScheme } = useTheme();
  const [note, setNote] = useState('');

  const { currentUser } = useAuth();

  async function addNoteToStudyNote() {
    if (!note) {
      alert('The note field is required.');
      return;
    }

    const { data: noteData, error: insertError } = await supabase
      .from('group_notes')
      .insert({ group_id: Number(groupId), note, user_id: currentUser?.id })
      .select();

    if (noteData && currentUser) {
      channel?.send({
        type: 'broadcast',
        event: 'message',
        payload: {
          id: noteData[0].id,
          note: note,
          created_at: noteData[0].created_at,
          reference: null,
          group_id: Number(groupId),
          user_id: currentUser.id,
          profiles: {
            username: currentUser.username,
            avatar_url: currentUser.avatar_url,
          },
        },
      });
    }
    setNote('');

    setVisible(false);
  }

  return (
    <Modal style={{ flex: 1 }} animationType="fade" transparent visible={visible}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}>
          <View className="w-11/12 items-center gap-4 rounded-xl bg-card p-4">
            <Pressable onPress={() => setVisible(false)} className="absolute right-2 top-2 p-2">
              <AntDesign
                name="close"
                size={24}
                color={colorScheme === 'dark' ? 'white' : 'black'}
              />
            </Pressable>
            <Text className="mb-2 text-xl font-semibold text-foreground sm:text-2xl">
              Share a Thought
            </Text>
            <TextInput
              autoFocus
              className="max-h-52 min-h-32 w-full rounded-lg border border-cardborder bg-input p-3 font-medium text-foreground"
              placeholderTextColor={colorScheme === 'dark' ? '#dcdcdc' : '#4b5563'}
              placeholder="Write your thoughts here..."
              textAlignVertical="top"
              selectionColor={colorScheme === 'dark' ? 'white' : 'black'}
              value={note}
              multiline
              numberOfLines={5}
              onChangeText={setNote}
            />

            <Pressable
              onPress={addNoteToStudyNote}
              className="mt-3 w-full items-center rounded-xl bg-primary p-3">
              <Text className="text-lg font-bold sm:text-xl">SHARE</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default InsertTextModal;
