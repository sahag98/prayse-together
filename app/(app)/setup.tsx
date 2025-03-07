import {
  Image,
  Pressable,
  Text,
  View,
  TextInput,
  Dimensions,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '~/utils/supabase';
import { useAuth } from '~/providers/auth-provider';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as ImageManipulator from 'expo-image-manipulator';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { registerForPushNotificationsAsync } from '~/utils/registerNotification';
import { useTheme } from '~/providers/theme-provider';

export default function Setup() {
  const { colorScheme } = useTheme();

  const { currentUser, setCurrentUser } = useAuth();
  const [step, setStep] = useState({ counter: 1, title: 'User Information' });
  const screenWidth = Dimensions.get('window').width;
  const translateX = useSharedValue(0);
  const progress = useSharedValue(0.5);
  const [profileImg, setProfileImg] = useState('');
  const [username, setUsername] = useState('');
  const [isNew, setIsNew] = useState(true);
  const [studyType, setStudyType] = useState('group');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [img, setImg] = useState<ImagePicker.ImagePickerAsset>();
  useEffect(() => {
    console.log('setup here');

    async function getNotificationToken() {
      if (!currentUser) return;
      const token = await registerForPushNotificationsAsync();

      const { error } = await supabase
        .from('profiles')
        .update({
          token: token,
        })
        .eq('id', currentUser.id);

      console.log('error: ', error);
    }
    getNotificationToken();
  }, []);

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
        router.push('/(app)/(tabs)');
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
      // setImg(image);

      if (!image.uri) {
        throw new Error('No image uri!'); // Realistically, this should never happen, but just in case...
      }

      const compressedImage = await ImageManipulator.manipulateAsync(
        image.uri,
        [{ resize: { width: 200, height: 200 } }], // Resize to 300x300 pixels (adjust as needed)
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG } // Compress and save as JPEG
      );

      setImg(compressedImage);

      const arraybuffer = await fetch(compressedImage.uri).then((res) => res.arrayBuffer());

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
      setStep({ counter: 2, title: 'Additional Setup' });
      progress.value = withTiming(1, { duration: 400 });
    }
  };

  const handlePreviousStep = () => {
    if (step.counter === 2) {
      translateX.value = 0; // Move back to the first step
      setStep({ counter: 1, title: 'User Information' });
      progress.value = withTiming(0.5, { duration: 400 });
    }
  };

  return (
    <>
      <SafeAreaView edges={['top']} className="flex-1 bg-background">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View className="w-full flex-1 self-center">
            {/* Progress Bar */}
            <View className="gap-2 px-6">
              <View className="flex-row items-center gap-1">
                <Text className="font-nunito-medium text-foreground">{step.counter}/2:</Text>
                <Text className="font-nunito-medium text-foreground">{step.title}</Text>
              </View>
              <View className="h-3 w-full rounded-lg bg-card">
                <Animated.View
                  className="bg-primary"
                  style={[{ height: '100%', borderRadius: 5 }, progressBarStyle]}
                />
              </View>
            </View>
            <Text className="mt-5 px-6 font-nunito-bold text-2xl text-foreground">
              Hey! Let's setup your app 👋
            </Text>
            <View className="flex-1 justify-center gap-4">
              <Animated.View
                style={[animatedStyle, { width: screenWidth * 2, flexDirection: 'row' }]}>
                <View className="gap-5 px-4" style={{ width: screenWidth }}>
                  {step.counter === 1 && (
                    <>
                      {img ? (
                        <Image
                          source={img}
                          accessibilityLabel="Avatar"
                          className="size-40 self-center rounded-full "
                          //   style={{ width: 40, height: 40 }}
                        />
                      ) : (
                        <Pressable
                          onPress={uploadAvatar}
                          className="size-40 items-center justify-center gap-3 self-center rounded-full border border-cardborder bg-card p-2">
                          {uploading ? (
                            <ActivityIndicator />
                          ) : (
                            <>
                              <Feather
                                name="upload"
                                size={40}
                                color={colorScheme === 'dark' ? 'white' : 'black'}
                              />
                              <Text className="w-4/5 text-center font-nunito-medium text-sm leading-4 text-foreground">
                                Upload profile image
                              </Text>
                            </>
                          )}
                        </Pressable>
                      )}

                      <TextInput
                        value={username}
                        onChangeText={setUsername}
                        selectionColor={colorScheme === 'dark' ? 'white' : 'black'}
                        placeholder="Enter your username"
                        placeholderTextColor={colorScheme === 'dark' ? '#dcdcdc' : '#4b5563'}
                        className="rounded-3xl bg-input p-4 text-foreground"
                        //   style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
                      />
                      <Pressable
                        disabled={!username || username.length <= 2}
                        className="disabled:bg-light-primary/50 items-center justify-center rounded-3xl bg-primary p-4"
                        onPress={handleNextStep}>
                        <Text className="font-nunito-bold text-base">Next</Text>
                      </Pressable>
                    </>
                  )}
                </View>

                <View className="px-4" style={{ width: screenWidth }}>
                  {step.counter === 2 && (
                    <>
                      {studyType === 'group' && (
                        <Pressable
                          className="items-center justify-center gap-3 rounded-3xl border border-dashed bg-primary p-6"
                          onPress={handlePresentModalPress}>
                          <AntDesign name="plus" size={40} color="black" />
                          <Text className="font-nunito-semibold text-base">Create study group</Text>
                        </Pressable>
                      )}
                      <View className="mt-5 gap-3">
                        <Pressable
                          className="items-center justify-center rounded-3xl bg-card p-4"
                          onPress={handlePreviousStep}>
                          <Text className="font-nunito-semibold text-base text-foreground">
                            Back
                          </Text>
                        </Pressable>
                      </View>

                      <Pressable
                        className="mt-5 items-center justify-center rounded-3xl  p-4"
                        onPress={updateProfile}>
                        <Text className="font-semibold text-foreground underline">Skip</Text>
                      </Pressable>
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
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}
