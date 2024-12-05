import { Image, Pressable, Text, View, TextInput, Dimensions } from 'react-native';
import { Container } from '~/components/Container';
import { supabase } from '~/utils/supabase';
import { useAuth } from '~/providers/auth-provider';
import { Redirect } from 'expo-router';
import { useState } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export default function Setup() {
  const { currentUser } = useAuth();
  const [step, setStep] = useState({ counter: 1, title: 'User Information' });
  const screenWidth = Dimensions.get('window').width;
  const translateX = useSharedValue(0);
  const progress = useSharedValue(0.33);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: withTiming(translateX.value, { duration: 400, easing: Easing.ease }) },
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
      setStep({ counter: 3, title: 'Create Information' });
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
          <View className="flex-1 justify-center gap-4">
            <Text className="mt-2 self-center text-2xl font-bold">Let's setup your profile</Text>
            <Animated.View
              style={[animatedStyle, { flexDirection: 'row', width: screenWidth * 3 }]}>
              <View className="gap-5 px-4" style={{ width: screenWidth }}>
                {step.counter === 1 && (
                  <>
                    <Pressable className="size-36 self-center rounded-full bg-gray-200">
                      {/* <Text>Upload your profile picture</Text> */}
                    </Pressable>
                    <TextInput
                      placeholder="Enter your username"
                      className="placeholder:text-light-foreground/60 rounded-3xl bg-gray-200 p-4"
                      //   style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
                    />
                    <Pressable
                      className="items-center justify-center rounded-3xl bg-light-primary p-4"
                      onPress={handleNextStep}>
                      <Text className="text-base font-semibold">Next</Text>
                    </Pressable>
                  </>
                )}
              </View>
              <View className="px-4" style={{ width: screenWidth }}>
                {step.counter === 2 && (
                  <>
                    <Text>Are you new to the Christian faith?</Text>
                    <TextInput
                      placeholder="Yes or No"
                      style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
                    />
                    <Text>Do you prefer group studies or individual studies?</Text>
                    <TextInput
                      placeholder="Group or Individual"
                      style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
                    />
                    <View className="mt-5 gap-3">
                      <Pressable
                        className="items-center justify-center rounded-3xl bg-light-primary p-4"
                        onPress={handleNextStep}>
                        <Text className="text-base font-semibold">Next</Text>
                      </Pressable>
                      <Pressable
                        className="items-center justify-center rounded-3xl bg-gray-200 p-4"
                        onPress={handlePreviousStep}>
                        <Text className="text-base font-semibold">Back</Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </View>
              <View className="px-4" style={{ width: screenWidth }}>
                {step.counter === 3 && (
                  <>
                    <Text>Create a Bible Study Group</Text>
                    <TextInput
                      placeholder="Yes or No"
                      style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
                    />
                    <Text>Do you prefer group studies or individual studies?</Text>
                    <TextInput
                      placeholder="Group or Individual"
                      style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
                    />
                    <View className="mt-5 gap-3">
                      <Pressable
                        className="items-center justify-center rounded-3xl bg-light-primary p-4"
                        onPress={handleNextStep}>
                        <Text className="text-base font-semibold">Next</Text>
                      </Pressable>
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
        </View>
      </Container>
    </>
  );
}
