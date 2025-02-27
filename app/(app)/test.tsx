import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Container } from '~/components/Container';
import Animated, {
  Extrapolation,
  interpolate,
  SensorType,
  useAnimatedSensor,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';

import { Canvas, Group, RoundedRect, vec } from '@shopify/react-native-skia';

const CanvasSize = {
  width: 500,
  height: 500,
};

const CanvasCenter = vec(CanvasSize.width / 2, CanvasSize.height / 2);

const test = () => {
  const deviceRotation = useAnimatedSensor(SensorType.ROTATION, {
    interval: 20,
  });
  const rotationGravity = useAnimatedSensor(SensorType.GRAVITY, {
    interval: 20,
  });

  const rotateY = useDerivedValue(() => {
    const { roll } = deviceRotation.sensor.value;

    return interpolate(roll, [-1, 0, 1], [Math.PI / 8, 0, -Math.PI / 8], Extrapolation.CLAMP);
  });

  const rotateX = useDerivedValue(() => {
    const { z } = rotationGravity.sensor.value;

    return interpolate(z, [-9, -6, -1], [-Math.PI / 8, 0, Math.PI / 8], Extrapolation.CLAMP);
  });

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 200 },
        { rotateY: `${rotateY.value}rad` },
        { rotateX: `${rotateX.value}rad` },
      ],
    };
  });

  const rTransform = useDerivedValue(() => {
    return [{ perspective: 200 }, { rotateY: rotateY.value }, { rotateX: rotateX.value }];
  });
  return (
    <Container>
      <View className="flex-1 items-center justify-center">
        <Animated.View style={[styles.square, rStyle]}>
          <Text className="text-white">Heyy</Text>
        </Animated.View>
      </View>
    </Container>
  );
};

export default test;

const styles = StyleSheet.create({
  square: {
    height: 176,
    width: 176,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    borderRadius: 35,
    borderCurve: 'continuous',
  },
});
