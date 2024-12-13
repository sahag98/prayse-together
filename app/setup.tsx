import {
  Image,
  Pressable,
  Text,
  View,
  TextInput,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Container } from '~/components/Container';
import { supabase } from '~/utils/supabase';
import { useAuth } from '~/providers/auth-provider';
import { Redirect, router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Feather from '@expo/vector-icons/Feather';
import CreateGroupModal from '~/modals/create-group';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { AntDesign } from '@expo/vector-icons';

export default function Setup() {
  const { currentUser, setCurrentUser } = useAuth();
  const [step, setStep] = useState({ counter: 1, title: 'User Information' });
  const screenWidth = Dimensions.get('window').width;
  const translateX = useSharedValue(0);
  const progress = useSharedValue(0.33);
  const [profileImg, setProfileImg] = useState('');
  const [username, setUsername] = useState('sahag');
  const [isNew, setIsNew] = useState(true);
  const [studyType, setStudyType] = useState('group');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  async function updateProfile() {
    try {
      setLoading(true);
      if (!currentUser) throw new Error('No user on the session!');

      const { error } = await supabase
        .from('profiles')
        .update({
          username: username,
          is_new: isNew,
          study_setting: studyType,
          avatar_url: profileImg,
        })
        .eq('id', currentUser.id);

      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      getProfile();
      setLoading(false);

      //   router.push('/(tabs)/home');
    }
  }

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  async function getProfile() {
    try {
      setLoading(true);
      if (!currentUser) throw new Error('No user on the session!');

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`*`)
        .eq('id', currentUser.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setCurrentUser(data);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path);

      if (error) {
        throw error;
      }

      const fr = new FileReader();
      fr.readAsDataURL(data);
      fr.onload = () => {
        setProfileImg(fr.result as string);
      };
    } catch (error) {
      if (error instanceof Error) {
        console.log('Error downloading image: ', error.message);
      }
    } finally {
      setUploading(false);
    }
  }
  async function uploadAvatar() {
    try {
      setUploading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // Restrict to only images
        allowsMultipleSelection: false, // Can only select one image
        allowsEditing: true, // Allows the user to crop / rotate their photo before uploading it
        quality: 1,
        exif: false, // We don't want nor need that data.
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log('User cancelled image picker.');
        return;
      }

      const image = result.assets[0];

      if (!image.uri) {
        throw new Error('No image uri!'); // Realistically, this should never happen, but just in case...
      }

      const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer());

      const fileExt = image.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg';
      const path = `${Date.now()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, arraybuffer, {
          contentType: image.mimeType ?? 'image/jpeg',
        });

      if (uploadError) {
        throw uploadError;
      }

      downloadImage(data.path);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      } else {
        throw error;
      }
    }
  }
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: withTiming(translateX.value, { duration: 300, easing: Easing.ease }) },
      ],
    };
  });

  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

  const handleNextStep = () => {
    if (step.counter === 1) {
      translateX.value = -screenWidth; // Move to the next step
      setStep({ counter: 2, title: 'Additional Information' });
      progress.value = withTiming(0.66, { duration: 400 });
    } else if (step.counter === 2) {
      translateX.value = -screenWidth * 2; // Move to the third step
      setStep({ counter: 3, title: 'Create first study group' });
      progress.value = withTiming(1, { duration: 400 });
    }
  };

  const handlePreviousStep = () => {
    if (step.counter === 2) {
      translateX.value = 0; // Move back to the first step
      setStep({ counter: 1, title: 'User Information' });
      progress.value = withTiming(0.33, { duration: 400 });
    }
    if (step.counter === 3) {
      translateX.value = -screenWidth; // Move back to the first step
      setStep({ counter: 2, title: 'Additional Information' });
      progress.value = withTiming(0.66, { duration: 400 });
    }
  };

  return (
    <>
      <Container>
        <View className="w-full flex-1 self-center">
          {/* Progress Bar */}
          <View className="gap-2 px-4">
            <View className="flex-row items-center gap-1">
              <Text className="font-medium">{step.counter}/3:</Text>
              <Text className="font-medium">{step.title}</Text>
            </View>
            <View className="h-3 w-full rounded-lg bg-gray-200">
              <Animated.View
                className="bg-light-primary"
                style={[{ height: '100%', borderRadius: 5 }, progressBarStyle]}
              />
            </View>
          </View>
          <Text className="mt-5 pl-4 text-2xl font-bold">Hey! Let's setup your app 👋</Text>
          <View className="flex-1 justify-center gap-4">
            <Animated.View
              style={[animatedStyle, { flexDirection: 'row', width: screenWidth * 3 }]}>
              <View className="gap-5 px-4" style={{ width: screenWidth }}>
                {step.counter === 1 && (
                  <>
                    {profileImg ? (
                      <Image
                        source={{ uri: profileImg }}
                        accessibilityLabel="Avatar"
                        className="size-40 self-center rounded-full "
                        //   style={{ width: 40, height: 40 }}
                      />
                    ) : (
                      <Pressable
                        onPress={uploadAvatar}
                        className="size-40 items-center justify-center gap-3 self-center rounded-full bg-gray-200 p-2">
                        {uploading ? (
                          <ActivityIndicator />
                        ) : (
                          <>
                            <Feather name="upload" size={40} color="black" />
                            <Text className="w-4/5 text-center text-sm leading-4">
                              Upload profile image
                            </Text>
                          </>
                        )}
                      </Pressable>
                    )}

                    <TextInput
                      value={username}
                      onChangeText={setUsername}
                      placeholder="Enter your username"
                      className="rounded-3xl bg-gray-200 p-4 placeholder:text-light-foreground/60"
                      //   style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
                    />
                    <Pressable
                      disabled={!username || username.length <= 2}
                      className="items-center justify-center rounded-3xl bg-light-primary p-4 disabled:bg-light-primary/50"
                      onPress={handleNextStep}>
                      <Text className="text-base font-semibold">Next</Text>
                    </Pressable>
                  </>
                )}
              </View>
              <View className="px-4" style={{ width: screenWidth }}>
                {step.counter === 2 && (
                  <View className="gap-3">
                    <Text className="font-medium">Are you new to the Christian faith?</Text>
                    <View className="w-full flex-row gap-3">
                      <Pressable
                        onPress={() => setIsNew(true)}
                        className={
                          isNew === true
                            ? 'flex-1 items-center justify-center rounded-xl bg-light-secondary p-6'
                            : 'flex-1 items-center justify-center rounded-xl bg-gray-200 p-6'
                        }>
                        <Text className="font-semibold">Yes</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setIsNew(false)}
                        className={
                          isNew === false
                            ? 'flex-1 items-center justify-center rounded-xl bg-light-secondary p-6'
                            : 'flex-1 items-center justify-center rounded-xl bg-gray-200 p-6'
                        }>
                        <Text className="font-semibold">No</Text>
                      </Pressable>
                    </View>
                    {/* <TextInput
                      placeholder="Enter your username"
                      className="placeholder:text-light-foreground/60 rounded-3xl bg-gray-200 p-4"
                    /> */}
                    <Text className="mt-1 font-medium">
                      Do you prefer group studies or individual studies?
                    </Text>
                    <View className="w-full flex-row gap-3">
                      <Pressable
                        onPress={() => setStudyType('group')}
                        className={
                          studyType === 'group'
                            ? 'flex-1 items-center justify-center rounded-xl bg-light-secondary p-6'
                            : 'flex-1 items-center justify-center rounded-xl bg-gray-200 p-6'
                        }>
                        <Text className="font-semibold">Group</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setStudyType('individual')}
                        className={
                          studyType === 'individual'
                            ? 'flex-1 items-center justify-center rounded-xl bg-light-secondary p-6'
                            : 'flex-1 items-center justify-center rounded-xl bg-gray-200 p-6'
                        }>
                        <Text className="font-semibold">Individual</Text>
                      </Pressable>
                    </View>
                    {/* <TextInput
                      placeholder="Group or Individual"
                      className="placeholder:text-light-foreground/60 rounded-3xl bg-gray-200 p-4"
                    /> */}
                    <View className="mt-5 gap-3">
                      <Pressable
                        disabled={!studyType}
                        className="items-center justify-center rounded-3xl bg-light-primary p-4 transition-all disabled:bg-light-primary/50"
                        onPress={handleNextStep}>
                        <Text className="text-base font-semibold">Next</Text>
                      </Pressable>
                      <Pressable
                        className="items-center justify-center rounded-3xl bg-gray-200 p-4"
                        onPress={handlePreviousStep}>
                        <Text className="text-base font-semibold">Back</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
              <View className="px-4" style={{ width: screenWidth }}>
                {step.counter === 3 && (
                  <>
                    {studyType === 'group' && (
                      <Pressable
                        className="items-center justify-center gap-3 rounded-3xl border border-dashed bg-light-primary p-6"
                        onPress={handlePresentModalPress}>
                        <AntDesign name="plus" size={40} color="black" />
                        <Text className="text-base font-semibold">Create study group</Text>
                      </Pressable>
                    )}
                    <View className="mt-5 gap-3">
                      <Pressable
                        className="items-center justify-center rounded-3xl bg-gray-200 p-4"
                        onPress={handlePreviousStep}>
                        <Text className="text-base font-semibold">Back</Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </View>
            </Animated.View>
          </View>
          <CreateGroupModal
            updateProfile={updateProfile}
            bottomSheetModalRef={bottomSheetModalRef}
          />
        </View>
      </Container>
    </>
  );
}
