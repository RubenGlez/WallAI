import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { FavoriteIcon } from "@/components/favorite-icon";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Color } from "@/types";

/** Returns true if the background is light (use black text), false if dark (use white text). */
function isLightBackground(hex: string): boolean {
  const h = hex.replace(/^#/, "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

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
  const lightBg = isLightBackground(color.hex);
  const textColor = lightBg ? "#000" : "#fff";
  const isVeryLight =
    color.hex.toLowerCase() === "#ffffff" ||
    color.hex.toLowerCase().startsWith("#fff");
  const showActionsRow = !selectionMode && onAddToPalette != null;

  return (
    <TouchableOpacity
      style={[styles.cell, { width: cardWidth, height: swatchSize }]}
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
      <View
        style={[
          styles.swatch,
          {
            width: swatchSize,
            height: swatchSize,
            backgroundColor: color.hex,
          },
          isVeryLight && { borderWidth: 1, borderColor: theme.border },
        ]}
      >
        <View style={styles.labelOverlay} pointerEvents="none">
          <Text
            style={[styles.labelName, { color: textColor }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {displayName}
          </Text>
          <Text
            style={[styles.labelCode, { color: textColor }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {color.code}
          </Text>
        </View>
        {selectionMode && isInPalette && (
          <View style={styles.selectedBadge} pointerEvents="none">
            <IconSymbol
              name="checkmark.circle.fill"
              size={20}
              color={theme.tint}
            />
          </View>
        )}
        {onFavorite != null && (
          <TouchableOpacity
            style={styles.favoriteBtn}
            onPress={onFavorite}
            accessibilityLabel={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            <FavoriteIcon
              isFavorite={isFavorite ?? false}
              size={18}
              color={textColor}
            />
          </TouchableOpacity>
        )}
        {showActionsRow && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={onAddToPalette}
            accessibilityLabel={
              isInPalette ? "Remove from palette" : "Add to palette"
            }
          >
            {isInPalette ? (
              <IconSymbol
                name="checkmark.circle.fill"
                size={20}
                color={theme.tint}
              />
            ) : (
              <IconSymbol name="plus" size={20} color={theme.icon} />
            )}
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    position: "relative",
  },
  swatch: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    position: "relative",
  },
  labelOverlay: {
    position: "absolute",
    left: Spacing.xs,
    right: Spacing.xs,
    bottom: Spacing.xs,
  },
  labelName: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  labelCode: {
    fontSize: 10,
    opacity: 0.9,
  },
  selectedBadge: {
    position: "absolute",
    top: Spacing.xs,
    right: Spacing.xs,
    zIndex: 1,
  },
  favoriteBtn: {
    position: "absolute",
    top: Spacing.xs,
    right: Spacing.xs,
    padding: Spacing.xs,
    zIndex: 1,
  },
  addBtn: {
    position: "absolute",
    bottom: Spacing.xs,
    right: Spacing.xs,
    padding: Spacing.xs,
    zIndex: 1,
  },
});
