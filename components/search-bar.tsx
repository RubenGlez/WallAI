import React from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  containerStyle?: ViewStyle;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder,
  containerStyle,
}: SearchBarProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const handleClear = () => {
    onChangeText("");
  };

  return (
    <View
      style={[
        styles.searchContainer,
        {
          borderColor: theme.border,
          backgroundColor: theme.backgroundSecondary,
        },
        containerStyle,
      ]}
    >
      <IconSymbol
        name="magnifyingglass"
        size={18}
        color={theme.textSecondary}
        style={styles.searchIcon}
      />
      <TextInput
        style={[styles.searchInput, { color: theme.text }]}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <IconSymbol
            name="xmark.circle.fill"
            size={18}
            color={theme.textSecondary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    padding: 0,
  },
  clearButton: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
});

