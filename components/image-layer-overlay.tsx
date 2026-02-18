/**
 * Reusable overlay for a single image layer (background or sketch).
 * Supports pan, pinch, rotation and opacity; persists config on gesture end.
 */
import type { LayerOverlayConfig } from "@/types";
import { Image } from "expo-image";
import React, { useCallback, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const springConfig = { damping: 15, stiffness: 150 };

export interface ImageLayerOverlayProps {
  imageUri: string;
  config: LayerOverlayConfig;
  containerWidth: number;
  containerHeight: number;
  onConfigChange: (config: LayerOverlayConfig) => void;
}

export function ImageLayerOverlay({
  imageUri,
  config,
  containerWidth,
  containerHeight,
  onConfigChange,
}: ImageLayerOverlayProps) {
  const translateX = useSharedValue(config.position.x);
  const translateY = useSharedValue(config.position.y);
  const scale = useSharedValue(config.scale);
  const rotation = useSharedValue(config.rotation);

  useEffect(() => {
    translateX.value = withSpring(config.position.x, springConfig);
    translateY.value = withSpring(config.position.y, springConfig);
    scale.value = withSpring(config.scale, springConfig);
    rotation.value = withSpring(config.rotation, springConfig);
  }, [
    config.position.x,
    config.position.y,
    config.scale,
    config.rotation,
    translateX,
    translateY,
    scale,
    rotation,
  ]);

  const persistConfig = useCallback(() => {
    onConfigChange({
      opacity: config.opacity,
      scale: scale.value,
      rotation: rotation.value,
      position: { x: translateX.value, y: translateY.value },
    });
  }, [config.opacity, onConfigChange, scale, rotation, translateX, translateY]);

  const panGesture = Gesture.Pan()
    .onChange((e) => {
      translateX.value += e.changeX;
      translateY.value += e.changeY;
    })
    .onEnd(() => {
      runOnJS(persistConfig)();
    });

  const pinchGesture = Gesture.Pinch()
    .onChange((e) => {
      scale.value *= e.scaleChange;
    })
    .onEnd(() => {
      runOnJS(persistConfig)();
    });

  const rotationGesture = Gesture.Rotation()
    .onChange((e) => {
      rotation.value += e.rotationChange;
    })
    .onEnd(() => {
      runOnJS(persistConfig)();
    });

  const composed = Gesture.Simultaneous(panGesture, pinchGesture, rotationGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}rad` },
    ],
  }));

  const baseSize = Math.min(containerWidth, containerHeight) * 0.75;

  return (
    <View
      style={[
        styles.container,
        {
          width: containerWidth,
          height: containerHeight,
        },
      ]}
      pointerEvents="box-none"
    >
      <GestureDetector gesture={composed}>
        <Animated.View
          style={[
            styles.layerWrap,
            {
              width: baseSize,
              height: baseSize,
              opacity: config.opacity,
            },
            animatedStyle,
          ]}
        >
          <Image
            source={{ uri: imageUri }}
            style={[styles.layerImage, { width: baseSize, height: baseSize }]}
            contentFit="contain"
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    top: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  layerWrap: {
    justifyContent: "center",
    alignItems: "center",
  },
  layerImage: {
    backgroundColor: "transparent",
  },
});
