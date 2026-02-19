import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Color } from "@/types";

const CARD_PADDING = Spacing.sm;

export type ColorGridCardProps = {
  color: Color;
  displayName: string;
  onPress: () => void;
  onAddToPalette?: () => void;
  /** When true, show checkmark and "in palette" state */
  isInPalette?: boolean;
  /** When true, tap on card toggles selection; no add button; check icon in swatch when selected */
  selectionMode?: boolean;
  /** When provided, show favorite button */
  isFavorite?: boolean;
  onFavorite?: () => void;
  cardWidth: number;
  swatchSize: number;
};

export function ColorGridCard({
  color,
  displayName,
  onPress,
  onAddToPalette,
  isInPalette = false,
  selectionMode = false,
  isFavorite,
  onFavorite,
  cardWidth,
  swatchSize,
}: ColorGridCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const isLight =
    color.hex.toLowerCase() === "#ffffff" ||
    color.hex.toLowerCase().startsWith("#fff");
  const showActionsRow = !selectionMode && onAddToPalette != null;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          width: cardWidth,
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderWidth: 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole={selectionMode ? "checkbox" : "button"}
      accessibilityState={selectionMode ? { checked: isInPalette } : undefined}
      accessibilityLabel={
        selectionMode
          ? isInPalette
            ? "Remove from palette"
            : "Add to palette"
          : undefined
      }
    >
      {selectionMode && isInPalette && (
        <View
          style={[styles.selectedRing, { borderColor: theme.tint }]}
          pointerEvents="none"
        />
      )}
      <View style={styles.swatchWrap}>
        <View
          style={[
            styles.swatch,
            {
              width: swatchSize,
              height: swatchSize,
              backgroundColor: color.hex,
            },
            isLight && { borderWidth: 1, borderColor: theme.border },
          ]}
        />
        {onFavorite != null && (
          <TouchableOpacity
            style={styles.favoriteBtn}
            onPress={onFavorite}
            accessibilityLabel={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            <IconSymbol
              name={isFavorite ? "star.fill" : "star"}
              size={18}
              color={isFavorite ? theme.warning : theme.icon}
            />
          </TouchableOpacity>
        )}
      </View>
      <ThemedText style={styles.name} numberOfLines={1} ellipsizeMode="tail">
        {displayName}
      </ThemedText>
      <ThemedText
        style={[styles.codeMeta, { color: theme.textSecondary }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {color.code}
      </ThemedText>
      {showActionsRow && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onAddToPalette}
            accessibilityLabel={
              isInPalette ? "Remove from palette" : "Add to palette"
            }
          >
            {isInPalette ? (
              <MaterialIcons name="check-circle" size={20} color={theme.tint} />
            ) : (
              <IconSymbol name="plus" size={20} color={theme.icon} />
            )}
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: CARD_PADDING,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    position: "relative",
  },
  selectedRing: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  swatchWrap: {
    alignSelf: "center",
    marginBottom: Spacing.xs,
    position: "relative",
  },
  swatch: {
    borderRadius: BorderRadius.md,
  },
  favoriteBtn: {
    position: "absolute",
    top: Spacing.xs,
    right: Spacing.xs,
    padding: Spacing.xs,
    zIndex: 1,
  },
  name: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  codeMeta: {
    fontSize: Typography.fontSize.xs,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionBtn: {
    padding: Spacing.xs,
  },
});
