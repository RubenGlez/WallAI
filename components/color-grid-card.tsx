import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { FavoriteIcon } from "@/components/favorite-icon";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BorderRadius, FontFamily, Spacing, Typography } from "@/constants/theme";
import { isLightHex } from "@/lib/color-contrast";
import type { Color } from "@/types";

export type ColorGridCardProps = {
  color: Color;
  displayName: string;
  onPress: () => void;
  isInPalette?: boolean;
  selectionMode?: boolean;
  isFavorite?: boolean;
  onFavorite?: () => void;
  cardWidth: number;
  swatchSize: number;
};

export function ColorGridCard({
  color,
  displayName,
  onPress,
  isInPalette = false,
  selectionMode = false,
  isFavorite,
  onFavorite,
  cardWidth,
  swatchSize,
}: ColorGridCardProps) {
  const lightBg = isLightHex(color.hex);
  const textColor = lightBg ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.9)";
  const subTextColor = lightBg ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.55)";

  return (
    <TouchableOpacity
      style={[styles.cell, { width: cardWidth, height: swatchSize }]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole={selectionMode ? "checkbox" : "button"}
      accessibilityState={selectionMode ? { checked: isInPalette } : undefined}
    >
      <View
        style={[
          styles.swatch,
          {
            width: swatchSize,
            height: swatchSize,
            backgroundColor: color.hex,
          },
        ]}
      >
        {/* Labels bottom-left */}
        <View style={styles.labelOverlay} pointerEvents="none">
          <Text style={[styles.labelCode, { color: subTextColor }]} numberOfLines={1}>
            {color.code}
          </Text>
          <Text style={[styles.labelName, { color: textColor }]} numberOfLines={1} ellipsizeMode="tail">
            {displayName}
          </Text>
        </View>

        {/* Selection check */}
        {selectionMode && isInPalette && (
          <View style={styles.selectedBadge} pointerEvents="none">
            <IconSymbol name="checkmark.circle.fill" size={18} color={textColor} />
          </View>
        )}

        {/* Favorite */}
        {onFavorite != null && (
          <TouchableOpacity
            style={styles.favoriteBtn}
            onPress={onFavorite}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            accessibilityLabel={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <FavoriteIcon isFavorite={isFavorite ?? false} size={16} color={textColor} />
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
    right: Spacing.xs + 24,
    bottom: Spacing.xs,
    gap: 1,
  },
  labelCode: {
    fontFamily: FontFamily.displaySemiBold,
    fontSize: 9,
    letterSpacing: Typography.letterSpacing.label,
    textTransform: "uppercase",
  },
  labelName: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
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
});
