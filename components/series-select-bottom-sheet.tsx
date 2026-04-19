import {
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { FavoriteIcon } from "@/components/favorite-icon";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Accent, BorderRadius, Spacing, Surface, Typography } from "@/constants/theme";
import { useSheetBackdrop } from "@/hooks/use-sheet-backdrop";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import type { SeriesWithCountAndBrand } from "@/types";

export type SeriesSelectBottomSheetRef = BottomSheetModal;

type Props = {
  series: SeriesWithCountAndBrand[];
  selectedSeriesIds: Set<string>;
  onToggleSeries: (seriesId: string) => void;
  onSelectAll?: () => void;
  onClear?: () => void;
};

export const SeriesSelectBottomSheet = forwardRef<
  SeriesSelectBottomSheetRef,
  Props
>(function SeriesSelectBottomSheet(
  { series, selectedSeriesIds, onToggleSeries, onSelectAll, onClear },
  ref,
) {
  const { t } = useTranslation();
  const favoriteSeriesIds = useFavoritesStore((s) => s.favoriteSeriesIds);
  const toggleFavoriteSeries = useFavoritesStore((s) => s.toggleFavoriteSeries);
  const renderBackdrop = useSheetBackdrop();

  return (
    <BottomSheetModal
      ref={ref}
      backgroundStyle={{
        backgroundColor: Surface.highest,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
      }}
      backdropComponent={renderBackdrop}
      enableDynamicSizing
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <ThemedText type="label" style={styles.sectionLabel}>
          {t("palettes.selectSeries")}
        </ThemedText>
        <ThemedText
          style={[styles.sectionSubtitle, { color: Accent.onSurfaceMuted }]}
        >
          {t("palettes.selectSeriesSubtitle")}
        </ThemedText>
        <View style={styles.seriesList}>
          {(onSelectAll != null || onClear != null) && (
            <View style={[styles.seriesRow, styles.selectAllRow]}>
              {onSelectAll != null ? (
                <TouchableOpacity
                  style={styles.selectAllLeft}
                  onPress={onSelectAll}
                  activeOpacity={0.7}
                  accessibilityRole="checkbox"
                  accessibilityState={{
                    checked:
                      series.length > 0 &&
                      selectedSeriesIds.size === series.length,
                  }}
                  accessibilityLabel={t("palettes.selectAll")}
                >
                  {series.length > 0 &&
                  selectedSeriesIds.size === series.length ? (
                    <IconSymbol
                      name="checkmark.square.fill"
                      size={24}
                      color={Accent.primary}
                    />
                  ) : (
                    <IconSymbol name="square" size={24} color={Accent.onSurfaceMuted} />
                  )}
                  <View style={styles.seriesLabelWrap}>
                    <ThemedText style={styles.seriesName} numberOfLines={1}>
                      {t("palettes.selectAll")}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ) : (
                <View style={styles.seriesLabelWrap} />
              )}
              {onClear != null && (
                <TouchableOpacity
                  onPress={onClear}
                  activeOpacity={0.7}
                  style={styles.clearBtn}
                  accessibilityLabel={t("palettes.clearSelection")}
                >
                  <ThemedText
                    style={[styles.clearLabel, { color: Accent.primary }]}
                    numberOfLines={1}
                  >
                    {t("palettes.clearSelection")}
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          )}
          {series.map((s) => {
            const isSelected = selectedSeriesIds.has(s.id);
            return (
              <TouchableOpacity
                key={s.id}
                style={[styles.seriesRow, isSelected && styles.seriesRowSelected]}
                onPress={() => onToggleSeries(s.id)}
                activeOpacity={0.7}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
              >
                {isSelected ? (
                  <IconSymbol
                    name="checkmark.square.fill"
                    size={24}
                    color={Accent.primary}
                  />
                ) : (
                  <IconSymbol name="square" size={24} color={Accent.onSurfaceMuted} />
                )}
                <View style={styles.seriesLabelWrap}>
                  <ThemedText
                    style={styles.seriesName}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {s.name}
                  </ThemedText>
                  <ThemedText
                    style={[styles.seriesMeta, { color: Accent.onSurfaceMuted }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {s.brandName} ·{" "}
                    {t("colors.colorCount", { count: s.colorCount })}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  style={styles.favoriteBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleFavoriteSeries(s.id);
                  }}
                  accessibilityLabel={
                    favoriteSeriesIds.includes(s.id)
                      ? t("colors.removeFromFavorites")
                      : t("colors.addToFavorites")
                  }
                  accessibilityRole="button"
                >
                  <FavoriteIcon
                    isFavorite={favoriteSeriesIds.includes(s.id)}
                    size={22}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },
  sectionLabel: {
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.md,
  },
  seriesList: {
    marginBottom: Spacing.lg,
  },
  seriesRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Surface.high,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xs,
  },
  seriesRowSelected: {
    backgroundColor: Surface.bright,
  },
  selectAllRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectAllLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },
  clearBtn: {
    paddingVertical: Spacing.xs,
    paddingLeft: Spacing.sm,
  },
  clearLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
  },
  seriesLabelWrap: {
    flex: 1,
    marginLeft: Spacing.sm,
    minWidth: 0,
  },
  seriesName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  seriesMeta: {
    fontSize: Typography.fontSize.sm,
    marginTop: 2,
  },
  favoriteBtn: {
    padding: Spacing.sm,
    marginLeft: Spacing.xs,
  },
});
