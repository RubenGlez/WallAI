import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, { forwardRef, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { FavoriteIcon } from "@/components/favorite-icon";
import { ThemedText } from "@/components/themed-text";
import {
  BorderRadius,
  Spacing,
  Typography,
  type SemanticColorPalette,
} from "@/constants/theme";
import {
  SHEET_BACKDROP_OPACITY,
  sheetModalBackground,
} from "@/constants/ui-primitives";
import { useTheme } from "@/hooks/use-theme";
import { findClosestColors } from "@/lib/colorMatch";
import { getColorDisplayName } from "@/lib/color";
import {
  getAllSeriesWithCount,
  getColorsBySeriesId,
  getSeriesById,
} from "@/stores/useCatalogStore";
import type { Color } from "@/types";

export type ColorDetailParams = {
  color: Color;
  displayName: string;
  brandName: string;
  seriesName: string;
};

export type ColorDetailBottomSheetRef = BottomSheetModal;

type ContentProps = {
  color: ColorDetailParams | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  /** When provided, similar color cards open this color's detail (same sheet, new content). */
  onOpenColor?: (color: Color) => void;
};

const SIMILAR_IN_SERIES_LIMIT = 6;
const SIMILAR_OTHER_SERIES_LIMIT = 8;
/** Wide enough for two-line labels; trailing scroll padding balances the row vs sheet edge */
const SIMILAR_CARD_WIDTH = 96;
const SIMILAR_SWATCH_SIZE = 56;

export function ColorDetailContent({
  color,
  isFavorite,
  onToggleFavorite,
  onOpenColor,
}: ContentProps) {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const isLight =
    color?.color.hex.toLowerCase() === "#ffffff" ||
    color?.color.hex.toLowerCase().startsWith("#fff");

  const sameSeriesMatches = useMemo(() => {
    if (!color) return [];
    const seriesColors = getColorsBySeriesId(color.color.seriesId).filter(
      (c) => c.id !== color.color.id,
    );
    return findClosestColors(
      color.color.hex,
      seriesColors,
      SIMILAR_IN_SERIES_LIMIT,
    );
  }, [color]);

  const otherSeriesMatches = useMemo(() => {
    if (!color) return [];
    const allSeries = getAllSeriesWithCount();
    const otherIds = allSeries
      .filter((s) => s.id !== color.color.seriesId)
      .map((s) => s.id);
    const otherColors = otherIds.flatMap((id) => getColorsBySeriesId(id));
    return findClosestColors(
      color.color.hex,
      otherColors,
      SIMILAR_OTHER_SERIES_LIMIT,
    );
  }, [color]);

  if (!color) return null;

  return (
    <BottomSheetScrollView
      style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.swatchWrap}>
        <View
          style={[
            styles.swatch,
            { backgroundColor: color.color.hex },
            isLight && { borderWidth: 1, borderColor: theme.border },
          ]}
        />
        <TouchableOpacity
          style={styles.favoriteBtn}
          onPress={onToggleFavorite}
          accessibilityLabel={
            isFavorite
              ? t("colors.removeFromFavorites")
              : t("colors.addToFavorites")
          }
        >
          <FavoriteIcon isFavorite={isFavorite} size={24} />
        </TouchableOpacity>
      </View>
      <ThemedText
        type="title"
        style={styles.name}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {color.displayName}
      </ThemedText>
      <ThemedText style={[styles.code, { color: theme.textSecondary }]}>
        {color.color.code}
      </ThemedText>
      <ThemedText style={[styles.meta, { color: theme.textSecondary }]}>
        {color.brandName} · {color.seriesName}
      </ThemedText>

      <ThemedText type="overline" style={styles.sectionTitle}>
        {t("colors.colorDetail.similarInSeries")}
      </ThemedText>
      <View style={styles.similarRowViewport}>
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.similarRowScroll}
          contentContainerStyle={styles.similarRow}
        >
          {sameSeriesMatches.map((match, index, arr) => (
            <SimilarColorCard
              key={match.catalogColor.id}
              color={match.catalogColor}
              displayName={getColorDisplayName(
                match.catalogColor,
                i18n.language,
              )}
              similarity={match.similarity}
              theme={theme}
              isLast={index === arr.length - 1}
              onPress={() => onOpenColor?.(match.catalogColor)}
            />
          ))}
        </ScrollView>
      </View>

      <ThemedText type="overline" style={styles.sectionTitle}>
        {t("colors.colorDetail.similarInOtherSeries")}
      </ThemedText>
      <View style={styles.similarRowViewport}>
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.similarRowScroll}
          contentContainerStyle={styles.similarRow}
        >
          {otherSeriesMatches.map((match, index, arr) => {
            const series = getSeriesById(match.catalogColor.seriesId);
            const subtitle = series?.name ?? match.catalogColor.code;
            return (
              <SimilarColorCard
                key={match.catalogColor.id}
                color={match.catalogColor}
                displayName={getColorDisplayName(
                  match.catalogColor,
                  i18n.language,
                )}
                subtitle={subtitle}
                similarity={match.similarity}
                theme={theme}
                isLast={index === arr.length - 1}
                onPress={() => onOpenColor?.(match.catalogColor)}
              />
            );
          })}
        </ScrollView>
      </View>
    </BottomSheetScrollView>
  );
}

type SimilarColorCardProps = {
  color: Color;
  displayName: string;
  subtitle?: string;
  similarity: number;
  theme: SemanticColorPalette;
  onPress: () => void;
  isLast?: boolean;
};

function SimilarColorCard({
  color,
  displayName,
  subtitle,
  similarity,
  theme,
  onPress,
  isLast,
}: SimilarColorCardProps) {
  const isVeryLight =
    color.hex.toLowerCase() === "#ffffff" ||
    color.hex.toLowerCase().startsWith("#fff");
  return (
    <TouchableOpacity
      style={[
        styles.similarCard,
        !isLast && styles.similarCardSpacing,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={`${displayName}, ${similarity}% similar`}
      accessibilityRole="button"
    >
      <View
        style={[
          styles.similarSwatch,
          { backgroundColor: color.hex },
          isVeryLight && { borderWidth: 1, borderColor: theme.border },
        ]}
      />
      <ThemedText
        type="caption"
        style={[styles.similarLabel, { color: theme.text }]}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {displayName}
      </ThemedText>
      {subtitle != null && (
        <ThemedText
          type="caption"
          style={styles.similarSubtitle}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {subtitle}
        </ThemedText>
      )}
      <ThemedText type="similarity" style={styles.similarPct}>
        {similarity}%
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  swatchWrap: {
    position: "relative",
    marginBottom: Spacing.md,
  },
  swatch: {
    width: "100%",
    aspectRatio: 2.5,
    borderRadius: BorderRadius.xl,
  },
  favoriteBtn: {
    position: "absolute",
    top: Spacing.xs,
    right: Spacing.xs,
    padding: Spacing.xs,
    zIndex: 1,
  },
  name: {
    textAlign: "left",
    marginBottom: Spacing.xs,
  },
  code: {
    textAlign: "left",
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs,
  },
  meta: {
    textAlign: "left",
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  /** Bounds nested horizontal ScrollView so row content cannot paint past sheet padding */
  similarRowViewport: {
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden",
    minHeight: SIMILAR_SWATCH_SIZE + 80,
  },
  similarRowScroll: {
    width: "100%",
    flexGrow: 0,
  },
  similarRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "flex-start",
    paddingBottom: Spacing.md,
    paddingRight: Spacing.md,
  },
  similarCard: {
    width: SIMILAR_CARD_WIDTH,
    maxWidth: SIMILAR_CARD_WIDTH,
    alignItems: "center",
    overflow: "hidden",
  },
  similarCardSpacing: {
    marginRight: Spacing.sm,
  },
  similarSwatch: {
    width: SIMILAR_SWATCH_SIZE,
    height: SIMILAR_SWATCH_SIZE,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xs,
  },
  similarLabel: {
    width: SIMILAR_CARD_WIDTH,
    maxWidth: SIMILAR_CARD_WIDTH,
    fontSize: Typography.fontSize.xs,
    textAlign: "center",
    alignSelf: "center",
  },
  similarSubtitle: {
    width: SIMILAR_CARD_WIDTH,
    maxWidth: SIMILAR_CARD_WIDTH,
    fontSize: Typography.fontSize.xs,
    textAlign: "center",
    alignSelf: "center",
    marginTop: 2,
  },
  similarPct: {
    width: SIMILAR_CARD_WIDTH,
    maxWidth: SIMILAR_CARD_WIDTH,
    fontSize: Typography.fontSize.xs,
    textAlign: "center",
    alignSelf: "center",
    marginTop: 2,
  },
});

type BottomSheetProps = ContentProps;

export const ColorDetailBottomSheet = forwardRef<
  ColorDetailBottomSheetRef,
  BottomSheetProps
>(function ColorDetailBottomSheet(
  { color, isFavorite, onToggleFavorite, onOpenColor },
  ref,
) {
  const { theme } = useTheme();

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={SHEET_BACKDROP_OPACITY}
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={ref}
      backgroundStyle={sheetModalBackground(theme)}
      backdropComponent={renderBackdrop}
      enableDynamicSizing
    >
      <ColorDetailContent
        color={color}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        onOpenColor={onOpenColor}
      />
    </BottomSheetModal>
  );
});
