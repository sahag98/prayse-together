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

const GetVerseModal = ({
  groupId,
  visible,
  setVisible,
}: {
  groupId: string | string[];
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [reference, setReference] = useState('');
  const [chapter, setChapter] = useState('');
  const [verse, setVerse] = useState('');
  const [verseEnd, setVerseEnd] = useState('');
  const [activeTab, setActiveTab] = useState('range');
  const { currentUser } = useAuth();

  async function addVerseToStudyNote() {
    const verse = await getBibleVerse();

    console.log('data: ', JSON.stringify(verse, null, 2));

    const reference = verse.reference;
    const note = verse.text.replace(/\s+/g, ' ');

    const { data: noteData, error: insertError } = await supabase
      .from('group_notes')
      .insert({ group_id: Number(groupId), note, reference, user_id: currentUser?.id })
      .select();
  }

  async function getBibleVerse() {
    if (!reference || !chapter || !verse) {
      alert('The fields are all required.');
    }

    let url;

    if (verseEnd) {
      url = `https://bible-api.com/${reference}+${chapter}:${verse}-${verseEnd}?translation=kjv`;
    } else {
      url = `https://bible-api.com/${reference} ${chapter}:${verse}?translation=kjv`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();

      // Log or return the verse details
      console.log('verse: ', JSON.stringify(data.text, null, 2));
      setReference('');
      setChapter('');
      setVerse('');
      setVerseEnd('');
      setActiveTab('range');
      setVisible(false);
      return data;
    } catch (error) {
      alert('Something went wrong. Make sure to input proper values...');
    }
  }
  return (
    <Modal animationType="fade" transparent visible={visible}>
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
          <View className="w-11/12 items-center gap-4 rounded-xl bg-light-background p-4">
            <Pressable onPress={() => setVisible(false)} className="absolute right-2 top-2 p-2">
              <AntDesign name="close" size={24} color="black" />
            </Pressable>
            <Text className="mb-2 text-2xl font-semibold">Add Bible Verse</Text>

            <TextInput
              autoFocus
              className="w-full rounded-lg border p-4 font-medium placeholder:text-gray-500"
              placeholder="Enter Reference (ex: John)"
              value={reference}
              onChangeText={setReference}
            />
            <View className="mb-3 flex-row gap-4 rounded-lg bg-gray-200 p-2">
              <Pressable
                onPress={() => setActiveTab('range')}
                style={{ backgroundColor: activeTab === 'range' ? 'white' : '' }}
                className="flex-1 items-center justify-center rounded-md bg-light-secondary  p-2">
                <Text className="font-bold">Range</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setActiveTab('specific');
                  setVerseEnd('');
                }}
                style={{ backgroundColor: activeTab === 'specific' ? 'white' : '' }}
                className="flex-1 items-center justify-center rounded-md p-2">
                <Text className="font-bold">Specific</Text>
              </Pressable>
            </View>
            {/* <View className="flex-row items-center gap-2">
              <View className="size-10 items-center justify-center rounded-lg border p-2">
                <TextInput
                  className="w-full text-center"
                  value={chapter}
                  onChangeText={setChapter}
                  numberOfLines={1}
                  keyboardType="numeric"
                />
              </View>
              <Text className="text-lg font-bold">:</Text>
              <View className="size-10 items-center justify-center rounded-lg border p-2">
                <TextInput
                  className="w-full text-center"
                  value={verse}
                  numberOfLines={1}
                  onChangeText={setVerse}
                  keyboardType="numeric"
                />
              </View>
            </View> */}
            {activeTab === 'range' && (
              <View className="flex-row items-center gap-2">
                <View className="size-12 items-center justify-center rounded-lg border p-2">
                  <TextInput
                    className="w-full text-center"
                    value={chapter}
                    onChangeText={setChapter}
                    numberOfLines={1}
                    keyboardType="numeric"
                  />
                </View>
                <Text className="text-lg font-bold">:</Text>
                <View className="size-12 items-center justify-center rounded-lg border p-2">
                  <TextInput
                    className="w-full text-center"
                    value={verse}
                    numberOfLines={1}
                    onChangeText={setVerse}
                    keyboardType="numeric"
                  />
                </View>
                <Text className="text-lg font-bold">-</Text>
                <View className="size-12 items-center justify-center rounded-lg border p-2">
                  <TextInput
                    className="w-full text-center"
                    value={verseEnd}
                    numberOfLines={1}
                    onChangeText={setVerseEnd}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            )}
            {activeTab === 'specific' && (
              <View className="flex-row items-center gap-2">
                <View className="size-12 items-center justify-center rounded-lg border p-2">
                  <TextInput
                    className="w-full text-center"
                    value={chapter}
                    onChangeText={setChapter}
                    numberOfLines={1}
                    keyboardType="numeric"
                  />
                </View>
                <Text className="text-lg font-bold">:</Text>
                <View className="size-12 items-center justify-center rounded-lg border p-2">
                  <TextInput
                    className="w-full text-center"
                    value={verse}
                    numberOfLines={1}
                    onChangeText={setVerse}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            )}

            <Pressable
              onPress={addVerseToStudyNote}
              className="mt-3 w-full items-center rounded-xl bg-light-primary p-3">
              <Text className="text-lg font-bold">ADD</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default GetVerseModal;
