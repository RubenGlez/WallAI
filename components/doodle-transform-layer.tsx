import React, { useMemo } from "react";
import { Image, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  type SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

export type TransformShared = {
  offsetX: SharedValue<number>;
  offsetY: SharedValue<number>;
  savedOffsetX: SharedValue<number>;
  savedOffsetY: SharedValue<number>;
  scale: SharedValue<number>;
  savedScale: SharedValue<number>;
  rotation: SharedValue<number>;
  savedRotation: SharedValue<number>;
  flipX: SharedValue<number>;
  flipY: SharedValue<number>;
  opacity: SharedValue<number>;
};

type Props = { imageUri: string; isActive: boolean } & TransformShared;

/**
 * A full-size absolute image layer with pan, pinch, and rotation gestures.
 * Gestures are only active when `isActive` is true.
 */
export function TransformableLayer({
  imageUri,
  offsetX,
  offsetY,
  savedOffsetX,
  savedOffsetY,
  scale,
  savedScale,
  rotation,
  savedRotation,
  flipX,
  flipY,
  opacity,
  isActive,
}: Props) {
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate((e) => {
          offsetX.value = savedOffsetX.value + e.translationX;
          offsetY.value = savedOffsetY.value + e.translationY;
        })
        .onEnd(() => {
          savedOffsetX.value = offsetX.value;
          savedOffsetY.value = offsetY.value;
        }),
    [offsetX, offsetY, savedOffsetX, savedOffsetY],
  );

  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .onChange((e) => {
          scale.value = scale.value * e.scaleChange;
        })
        .onEnd(() => {
          savedScale.value = scale.value;
        }),
    [scale, savedScale],
  );

  const rotationGesture = useMemo(
    () =>
      Gesture.Rotation()
        .onChange((e) => {
          rotation.value = rotation.value + e.rotationChange;
        })
        .onEnd(() => {
          savedRotation.value = rotation.value;
        }),
    [rotation, savedRotation],
  );

  const composed = useMemo(
    () => Gesture.Simultaneous(panGesture, pinchGesture, rotationGesture),
    [panGesture, pinchGesture, rotationGesture],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    width: "100%",
    height: "100%",
    opacity: opacity.value,
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
      { scale: scale.value },
      { scaleX: flipX.value },
      { scaleY: flipY.value },
      { rotate: `${rotation.value}rad` },
    ],
  }));

  const content = (
    <Animated.View
      style={[styles.layer, animatedStyle]}
      pointerEvents={isActive ? "box-none" : "none"}
    >
      <Image
        source={{ uri: imageUri }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="contain"
      />
    </Animated.View>
  );

  if (isActive) {
    return <GestureDetector gesture={composed}>{content}</GestureDetector>;
  }
  return content;
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
});
