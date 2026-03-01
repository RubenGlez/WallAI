import { useEffect, useRef } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

const SPRING_CONFIG = { damping: 22, stiffness: 500 };

export type FavoriteIconProps = {
  isFavorite: boolean;
  size?: number;
  /** Color when not favorite. Defaults to theme.icon */
  color?: string;
  /** Color when favorite. Defaults to theme.warning */
  colorFavorite?: string;
};

/**
 * Star icon with a short bounce animation when isFavorite becomes true.
 * Use inside a TouchableOpacity; this component does not handle press.
 */
export function FavoriteIcon({
  isFavorite,
  size = 22,
  color,
  colorFavorite,
}: FavoriteIconProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const defaultColor = color ?? theme.icon;
  const defaultColorFavorite = colorFavorite ?? theme.warning;

  const scale = useSharedValue(1);
  const wasFavorite = useRef(isFavorite);

  useEffect(() => {
    if (isFavorite && !wasFavorite.current) {
      scale.value = withSequence(
        withSpring(1.35, SPRING_CONFIG),
        withSpring(1, SPRING_CONFIG),
      );
    }
    wasFavorite.current = isFavorite;
  }, [isFavorite, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <IconSymbol
        name={isFavorite ? "star.fill" : "star"}
        size={size}
        color={isFavorite ? defaultColorFavorite : defaultColor}
      />
    </Animated.View>
  );
}
