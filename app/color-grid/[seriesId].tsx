import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

import { Button } from "@/components/button";
import {
  ColorDetailBottomSheet,
  type ColorDetailBottomSheetRef,
  type ColorDetailParams,
} from "@/components/color-detail-bottom-sheet";
import { ColorGridCard } from "@/components/color-grid-card";
import { ColorGridList } from "@/components/color-grid-list";
import { HeaderBackButton } from "@/components/header-back-button";
import { Screen } from "@/components/screen";
import { SearchInput } from "@/components/search-input";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { COLOR_GRID } from "@/constants/color-grid";
import { Accent, Spacing } from "@/constants/theme";
import { filterColorsBySearch, getColorDisplayName } from "@/lib/color";
import { buildColorDetailParams } from "@/lib/color-detail-params";
import { getColorsBySeriesId, getSeriesById } from "@/stores/useCatalogStore";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import type { Color } from "@/types";

export default function ColorGridScreen() {
  const { seriesId } = useLocalSearchParams<{ seriesId: string }>();
  const { t, i18n } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [detailParams, setDetailParams] = useState<ColorDetailParams | null>(
    null,
  );
  const detailSheetRef = useRef<ColorDetailBottomSheetRef>(null);

  const series = seriesId ? getSeriesById(seriesId) : undefined;
  const allColors = useMemo(
    () => (seriesId ? getColorsBySeriesId(seriesId) : []),
    [seriesId],
  );

  const favoriteColorIds = useFavoritesStore((s) => s.favoriteColorIds);

  const filteredColors = useMemo(() => {
    let list = allColors;
    if (showOnlyFavorites) {
      list = list.filter((c) => favoriteColorIds.includes(c.id));
    }
    return filterColorsBySearch(list, searchQuery, i18n.language);
  }, [
    allColors,
    searchQuery,
    showOnlyFavorites,
    favoriteColorIds,
    i18n.language,
  ]);

  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const handleFavorite = useCallback(
    (color: Color) => {
      toggleFavorite(color.id);
    },
    [toggleFavorite],
  );

  const openDetailSheet = useCallback(
    (item: Color) => {
      setDetailParams(buildColorDetailParams(item, i18n.language, t));
      detailSheetRef.current?.present();
    },
    [i18n.language, t],
  );

  const renderCard = useCallback(
    (item: Color) => (
      <ColorGridCard
        color={item}
        displayName={getColorDisplayName(item, i18n.language)}
        onPress={() => openDetailSheet(item)}
        isFavorite={favoriteColorIds.includes(item.id)}
        onFavorite={() => handleFavorite(item)}
        cardWidth={COLOR_GRID.CARD_WIDTH}
        swatchSize={COLOR_GRID.SWATCH_SIZE}
      />
    ),
    [i18n.language, favoriteColorIds, openDetailSheet, handleFavorite],
  );

  return (
    <Screen>
      <View style={styles.container}>
        <HeaderBackButton
          title={series?.name ?? t("colors.title")}
          right={
            <Button
              variant="ghost"
              size="icon"
              onPress={() => setShowOnlyFavorites((s) => !s)}
              accessibilityLabel={
                showOnlyFavorites
                  ? t("colors.showAllColors")
                  : t("colors.showOnlyFavorites")
              }
              icon={
                <IconSymbol
                  name={showOnlyFavorites ? "star.fill" : "star"}
                  size={24}
                  color={showOnlyFavorites ? Accent.primary : Accent.onSurfaceMuted}
                />
              }
            />
          }
        />
        <ColorDetailBottomSheet
          ref={detailSheetRef}
          color={detailParams}
          isFavorite={
            detailParams
              ? favoriteColorIds.includes(detailParams.color.id)
              : false
          }
          onToggleFavorite={() =>
            detailParams && handleFavorite(detailParams.color)
          }
          onOpenColor={openDetailSheet}
        />

        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t("colors.searchPlaceholder")}
          clearAccessibilityLabel={t("common.clear")}
        />

        <ColorGridList
          colors={filteredColors}
          renderCard={renderCard}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
});
