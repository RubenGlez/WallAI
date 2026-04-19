import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FavoriteIcon } from "@/components/favorite-icon";
import { ThemedText } from "@/components/themed-text";
import { Accent, BorderRadius, FontFamily, Spacing, Surface, Typography } from "@/constants/theme";
import type { SeriesWithCountAndBrand } from "@/types";

export function SeriesCard({
  series,
  isFavorite,
  onPress,
  onFavorite,
}: {
  series: SeriesWithCountAndBrand;
  isFavorite: boolean;
  onPress: () => void;
  onFavorite: () => void;
}) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.card}
      onPress={onPress}
    >
      {/* Primary metric top-right — big dim number for data density */}
      <ThemedText style={styles.metric}>
        {series.colorCount}
      </ThemedText>

      <TouchableOpacity
        style={styles.favoriteBtn}
        onPress={onFavorite}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel={
          isFavorite
            ? t("colors.removeFromFavorites")
            : t("colors.addToFavorites")
        }
      >
        <FavoriteIcon isFavorite={isFavorite} size={20} />
      </TouchableOpacity>

      <View style={styles.content}>
        <ThemedText style={styles.cardTitle} numberOfLines={2}>
          {series.name}
        </ThemedText>
        <ThemedText style={styles.brandName} numberOfLines={1}>
          {series.brandName}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: Surface.base,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    minHeight: 90,
    overflow: "hidden",
  },
  metric: {
    position: "absolute",
    top: Spacing.sm + Spacing.xs,
    right: Spacing.sm,
    fontFamily: FontFamily.displayBold,
    fontSize: Typography.fontSize.lg,
    color: Accent.primary,
    opacity: 0.25,
    lineHeight: Typography.fontSize.lg,
  },
  favoriteBtn: {
    position: "absolute",
    top: Spacing.sm,
    left: Spacing.sm,
    zIndex: 1,
    padding: Spacing.xs,
  },
  content: {
    marginTop: Spacing.lg + Spacing.xs,
    gap: 2,
  },
  cardTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: FontFamily.displaySemiBold,
    color: Accent.onSurface,
  },
  brandName: {
    fontFamily: FontFamily.displaySemiBold,
    fontSize: Typography.fontSize.xs,
    color: Accent.onSurfaceMuted,
    textTransform: "uppercase",
    letterSpacing: Typography.letterSpacing.label,
  },
});
