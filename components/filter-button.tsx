import React from "react";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface FilterButtonProps {
  onPress: () => void;
  hasActiveFilters?: boolean;
  iconSize?: number;
  style?: ViewStyle;
}

export function FilterButton({
  onPress,
  hasActiveFilters = false,
  iconSize = 24,
  style,
}: FilterButtonProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <TouchableOpacity
      style={[styles.filterButton, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <IconSymbol
        name="line.3.horizontal.decrease.circle.fill"
        size={iconSize}
        color={hasActiveFilters ? theme.tint : theme.text}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  filterButton: {
    padding: Spacing.xs,
  },
});
