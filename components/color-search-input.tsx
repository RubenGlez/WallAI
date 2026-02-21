import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

import { Button } from "@/components/button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export type ColorSearchInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  clearAccessibilityLabel: string;
};

export function ColorSearchInput({
  value,
  onChangeText,
  placeholder,
  clearAccessibilityLabel,
}: ColorSearchInputProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <View style={styles.wrap}>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.backgroundSecondary,
            borderColor: theme.border,
            color: theme.text,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Button
          variant="ghost"
          size="icon"
          style={styles.clearBtn}
          onPress={() => onChangeText("")}
          accessibilityLabel={clearAccessibilityLabel}
          icon={
            <IconSymbol
              name="xmark.circle.fill"
              size={22}
              color={theme.textSecondary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    marginBottom: Spacing.md,
  },
  input: {
    height: 44,
    paddingHorizontal: Spacing.md,
    paddingRight: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: Typography.fontSize.md,
  },
  clearBtn: {
    position: "absolute",
    right: Spacing.sm,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    padding: Spacing.xs,
  },
});
