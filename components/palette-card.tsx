import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { getListCardWidth, LIST_GAP } from "@/constants/list-layout";
import { BorderRadius, Shadows, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { Color, Palette } from "@/types";

const CARD_WIDTH = getListCardWidth();
const CARD_PADDING = Spacing.md;
const SWATCH_SIZE = (CARD_WIDTH - CARD_PADDING * 2) / 4 - 2;
const SWATCHES_TO_SHOW = 7;

export function PaletteCard({
  palette,
  onPress,
}: {
  palette: Palette;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const swatches = palette.colors.slice(0, SWATCHES_TO_SHOW) as Color[];
  const extraCount =
    palette.colors.length > SWATCHES_TO_SHOW
      ? palette.colors.length - SWATCHES_TO_SHOW
      : 0;
  const isLight = (hex: string) =>
    hex.toLowerCase() === "#ffffff" || hex.toLowerCase().startsWith("#fff");

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.swatchRow}>
        {swatches.length > 0 ? (
          <>
            {swatches.map((c) => (
              <View
                key={c.id}
                style={[
                  styles.swatch,
                  { backgroundColor: c.hex },
                  isLight(c.hex) && {
                    borderWidth: 1,
                    borderColor: theme.border,
                  },
                ]}
              />
            ))}
            {extraCount > 0 && (
              <View style={styles.swatchMore}>
                <ThemedText
                  style={[
                    styles.swatchMoreText,
                    { color: theme.textSecondary },
                  ]}
                >
                  +{extraCount}
                </ThemedText>
              </View>
            )}
          </>
        ) : (
          <View
            style={[
              styles.swatchPlaceholder,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <IconSymbol
              name="swatchpalette"
              size={20}
              color={theme.textSecondary}
            />
          </View>
        )}
      </View>
      <ThemedText style={styles.cardTitle} numberOfLines={1}>
        {palette.name || t("common.untitled")}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    padding: CARD_PADDING,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: LIST_GAP,
    ...Shadows.sm,
  },
  swatchRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
    marginBottom: Spacing.sm,
    minHeight: SWATCH_SIZE * 2 + 2,
  },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: BorderRadius.sm,
  },
  swatchPlaceholder: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  swatchMore: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  swatchMoreText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  cardTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
});
