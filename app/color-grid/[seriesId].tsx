import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, FlatList, StyleSheet, View } from "react-native";

import { Button } from "@/components/button";
import {
  ColorDetailBottomSheet,
  type ColorDetailBottomSheetRef,
  type ColorDetailParams,
} from "@/components/color-detail-bottom-sheet";
import { ColorGridCard } from "@/components/color-grid-card";
import { HeaderBackButton } from "@/components/header-back-button";
import { Screen } from "@/components/screen";
import { SearchInput } from "@/components/search-input";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { filterColorsBySearch, getColorDisplayName } from "@/lib/color";
import {
  getBrandById,
  getColorsBySeriesId,
  getSeriesById,
} from "@/stores/useCatalogStore";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import type { Color } from "@/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const NUM_COLUMNS = 3;
const GAP = Spacing.sm;
const HORIZONTAL_PADDING = Spacing.md;
const CARD_WIDTH =
  (width - HORIZONTAL_PADDING * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
const SWATCH_SIZE = CARD_WIDTH;

export default function ColorGridScreen() {
  const { seriesId } = useLocalSearchParams<{ seriesId: string }>();
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();

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

  const inset = useSafeAreaInsets();

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
                  color={showOnlyFavorites ? theme.tint : theme.icon}
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

        <FlatList
          data={filteredColors}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={NUM_COLUMNS}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{ paddingBottom: inset.bottom }}
          showsVerticalScrollIndicator={false}
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
  row: {
    flexDirection: "row",
    marginBottom: GAP,
  },
});
