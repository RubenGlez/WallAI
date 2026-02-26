import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, StyleSheet, View } from "react-native";

import { Button } from "@/components/button";
import {
  ColorDetailBottomSheet,
  type ColorDetailBottomSheetRef,
  type ColorDetailParams,
} from "@/components/color-detail-bottom-sheet";
import { ColorGridCard } from "@/components/color-grid-card";
import { ColorSearchInput } from "@/components/color-search-input";
import { Screen } from "@/components/screen";
import { ScreenHeader } from "@/components/screen-header";
import {
  SeriesSelectBottomSheet,
  type SeriesSelectBottomSheetRef,
} from "@/components/series-select-bottom-sheet";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { COLOR_GRID } from "@/constants/color-grid";
import { Spacing } from "@/constants/theme";
import { useSeriesColorSelection } from "@/hooks/use-series-color-selection";
import { useTheme } from "@/hooks/use-theme";
import { filterColorsBySearch, getColorDisplayName } from "@/lib/color";
import { getBrandById, getSeriesById } from "@/stores/useCatalogStore";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import type { Color } from "@/types";

const { NUM_COLUMNS, GAP, CARD_WIDTH, SWATCH_SIZE } = COLOR_GRID;

export default function CatalogScreen() {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const { allSeries, selectedSeriesIds, toggleSeriesSelection, allColors } =
    useSeriesColorSelection();

  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [detailParams, setDetailParams] = useState<ColorDetailParams | null>(
    null,
  );
  const detailSheetRef = useRef<ColorDetailBottomSheetRef>(null);
  const seriesFilterSheetRef = useRef<SeriesSelectBottomSheetRef>(null);

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
      const s = getSeriesById(item.seriesId);
      const brand = s ? getBrandById(s.brandId) : undefined;
      setDetailParams({
        color: item,
        displayName: getColorDisplayName(item, i18n.language),
        brandName: brand?.name ?? t("common.notAvailable"),
        seriesName: s?.name ?? t("common.notAvailable"),
      });
      detailSheetRef.current?.present();
    },
    [i18n.language, t],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Color; index: number }) => (
      <View
        style={{
          width: CARD_WIDTH,
          marginRight: index % NUM_COLUMNS === NUM_COLUMNS - 1 ? 0 : GAP,
        }}
      >
        <ColorGridCard
          color={item}
          displayName={getColorDisplayName(item, i18n.language)}
          onPress={() => openDetailSheet(item)}
          isFavorite={favoriteColorIds.includes(item.id)}
          onFavorite={() => handleFavorite(item)}
          cardWidth={CARD_WIDTH}
          swatchSize={SWATCH_SIZE}
        />
      </View>
    ),
    [i18n.language, favoriteColorIds, openDetailSheet, handleFavorite],
  );

  return (
    <>
      <Screen>
        <View style={styles.container}>
          <ScreenHeader
            title={t("catalog.overviewTitle")}
            right={
              <View style={styles.headerRightRow}>
                <Button
                  variant="ghost"
                  size="icon"
                  onPress={() => setShowOnlyFavorites((s) => !s)}
                  accessibilityLabel={
                    showOnlyFavorites
                      ? t("catalog.showAllColors")
                      : t("catalog.showOnlyFavorites")
                  }
                  icon={
                    <IconSymbol
                      name={showOnlyFavorites ? "star.fill" : "star"}
                      size={24}
                      color={showOnlyFavorites ? theme.tint : theme.icon}
                    />
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onPress={() => seriesFilterSheetRef.current?.present()}
                  accessibilityLabel={t("palettes.selectSeries")}
                  icon={
                    <IconSymbol
                      name="line.3.horizontal.decrease.circle.fill"
                      size={24}
                      color={theme.tint}
                    />
                  }
                />
              </View>
            }
          />

          <ColorSearchInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t("catalog.searchPlaceholder")}
            clearAccessibilityLabel={t("common.clear")}
          />

          <FlatList
            data={filteredColors}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            numColumns={NUM_COLUMNS}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Screen>

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

      <SeriesSelectBottomSheet
        ref={seriesFilterSheetRef}
        series={allSeries}
        selectedSeriesIds={selectedSeriesIds}
        onToggleSeries={toggleSeriesSelection}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  headerRightRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: Spacing.md,
  },
  row: {
    marginBottom: Spacing.sm,
  },
});
