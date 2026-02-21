import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import {
  BorderRadius,
  Shadows,
  Spacing,
  Typography,
} from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type EmptyStateCardProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
};

export function EmptyStateCard({
  icon,
  title,
  subtitle,
  onPress,
}: EmptyStateCardProps) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundSecondary,
          borderColor: theme.border,
        },
      ]}
      onPress={onPress}
    >
      <View style={[styles.iconWrap, { backgroundColor: theme.card }]}>
        <MaterialIcons name={icon} size={28} color={theme.tint} />
      </View>
      <ThemedText style={[styles.title, { color: theme.text }]}>
        {title}
      </ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
        {subtitle}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderStyle: "dashed",
    minHeight: 140,
    ...Shadows.sm,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    textAlign: "center",
  },
});
