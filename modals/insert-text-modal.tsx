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

const InsertTextModlal = ({
  groupId,
  visible,
  setVisible,
}: {
  groupId: string | string[];
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
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
          <View className="w-4/5 items-center gap-4 rounded-xl bg-light-background p-4">
            <Pressable onPress={() => setVisible(false)} className="absolute right-2 top-2 p-2">
              <AntDesign name="close" size={24} color="black" />
            </Pressable>
            <Text className="mb-2 text-xl font-semibold">Add Text</Text>
            <TextInput
              autoFocus
              className="max-h-52 min-h-32 w-full rounded-lg border p-3 font-medium placeholder:text-gray-500"
              placeholder="Enter text"
              value={note}
              multiline
              numberOfLines={5}
              onChangeText={setNote}
            />

            <Pressable
              onPress={addNoteToStudyNote}
              className="mt-3 w-full items-center rounded-xl bg-light-primary p-3">
              <Text className="text-lg font-bold">ADD</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default InsertTextModlal;
