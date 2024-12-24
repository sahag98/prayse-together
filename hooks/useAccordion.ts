import {
  measure,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export const useAccordion = () => {
  const animateRef = useAnimatedRef();
  const isOpened = useSharedValue(false);
  const height = useSharedValue(0);

  const animateHeightStyle = useAnimatedStyle(() => ({
    height: withTiming(height.value),
  }));

  const setHeight = () => {
    'worklet';

    height.value = !height.value ? Number(measure(animateRef)?.height ?? 0) : 0;
    isOpened.value = !isOpened.value;
  };

  return {
    animateRef,
    setHeight,
    isOpened,
    animateHeightStyle,
  };
};
