import React, { forwardRef } from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Accent, BorderRadius, FontFamily, Spacing, Surface, Typography } from "@/constants/theme";
import { getColorDisplayName } from "@/lib/color";
import type { Palette } from "@/types";

const EXPORT_WIDTH = 720;
const COLS = 5;
const GRID_PADDING = Spacing.lg * 2;
const SWATCH_GAP = Spacing.sm;
const SWATCH_SIZE = (EXPORT_WIDTH - GRID_PADDING - (COLS - 1) * SWATCH_GAP) / COLS;

type Props = { palette: Palette; language: string };

export const PaletteExportView = forwardRef<View, Props>(
  function PaletteExportView({ palette, language }, ref) {
    return (
      <View ref={ref} style={styles.container}>
        <ThemedText style={styles.title} numberOfLines={2}>
          {palette.name}
        </ThemedText>

        <View style={styles.grid}>
          {palette.colors.map((color) => (
            <View key={color.id} style={styles.swatchWrap}>
              <View style={[styles.swatch, { backgroundColor: color.hex }]} />
              <ThemedText style={styles.swatchCode} numberOfLines={1}>
                {getColorDisplayName(color, language)}
              </ThemedText>
              <ThemedText style={styles.swatchHex} numberOfLines={1}>
                {color.hex}
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.watermark}>SprayDeck</ThemedText>
          <ThemedText style={styles.colorCount}>
            {palette.colors.length} colors
          </ThemedText>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: EXPORT_WIDTH,
    backgroundColor: Surface.low,
    padding: Spacing.lg * 2,
    gap: Spacing.xl,
  },
  title: {
    fontFamily: FontFamily.displayBold,
    fontSize: Typography.fontSize.xxxl,
    color: Accent.onSurface,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SWATCH_GAP,
  },
  swatchWrap: {
    width: SWATCH_SIZE,
    gap: Spacing.xs,
  },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: BorderRadius.md,
  },
  swatchCode: {
    fontFamily: FontFamily.displayMedium,
    fontSize: 11,
    color: Accent.onSurface,
  },
  swatchHex: {
    fontSize: 10,
    color: Accent.onSurfaceMuted,
    fontFamily: FontFamily.displayMedium,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.sm,
  },
  watermark: {
    fontFamily: FontFamily.displayBold,
    fontSize: Typography.fontSize.sm,
    color: Accent.primary,
    letterSpacing: Typography.letterSpacing.wider,
    textTransform: "uppercase",
  },
  colorCount: {
    fontSize: Typography.fontSize.sm,
    color: Accent.onSurfaceMuted,
  },
});
