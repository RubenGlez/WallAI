import { useEffect, useRef } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Accent } from "@/constants/theme";

const SPRING = { damping: 14, stiffness: 600, mass: 0.6 };

export type FavoriteIconProps = {
  isFavorite: boolean;
  size?: number;
  color?: string;
};

/**
 * Star icon with a pop + twist animation when isFavorite becomes true.
 * Use inside a TouchableOpacity; this component does not handle press.
 */
export function FavoriteIcon({
  isFavorite,
  size = 22,
  color,
}: FavoriteIconProps) {
  const iconColor = color ?? Accent.onSurface;

  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const wasFavorite = useRef(isFavorite);

  useEffect(() => {
    if (isFavorite && !wasFavorite.current) {
      scale.value = withSequence(withSpring(1.4, SPRING), withSpring(1, SPRING));
      rotate.value = withSequence(withSpring(20, SPRING), withSpring(0, SPRING));
    }
    wasFavorite.current = isFavorite;
  }, [isFavorite, scale, rotate]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <IconSymbol
        name={isFavorite ? "star.fill" : "star"}
        size={size}
        color={iconColor}
      />
    </Animated.View>
  );
}
