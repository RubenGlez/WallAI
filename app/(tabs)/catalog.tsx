import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import {
  ColorDetailBottomSheet,
  type ColorDetailBottomSheetRef,
  type ColorDetailParams,
} from "@/components/color-detail-bottom-sheet";
import { ColorGridCard } from "@/components/color-grid-card";
import { ColorGridList } from "@/components/color-grid-list";
import { Screen } from "@/components/screen";
import { ScreenHeader } from "@/components/screen-header";
import { SearchInput } from "@/components/search-input";
import {
  SeriesSelectBottomSheet,
  type SeriesSelectBottomSheetRef,
} from "@/components/series-select-bottom-sheet";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { COLOR_GRID } from "@/constants/color-grid";
import { Accent, BorderRadius, FontFamily, Spacing, Surface, Typography } from "@/constants/theme";
import { useSeriesColorSelection } from "@/hooks/use-series-color-selection";
import { filterColorsBySearch, getColorDisplayName } from "@/lib/color";
import { buildColorDetailParams } from "@/lib/color-detail-params";
import { getBrandsWithCount, getSeriesWithCountByBrandId } from "@/stores/useCatalogStore";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import type { Color } from "@/types";
const ALL_BRAND_ID = "__all__";

export default function CatalogScreen() {
  const { t, i18n } = useTranslation();
  const {
    allSeries,
    selectedSeriesIds,
    setSelectedSeriesIds,
    toggleSeriesSelection,
    allColors,
  } = useSeriesColorSelection();

  const brands = useMemo(() => getBrandsWithCount(), []);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [detailParams, setDetailParams] = useState<ColorDetailParams | null>(null);
  const detailSheetRef = useRef<ColorDetailBottomSheetRef>(null);
  const seriesFilterSheetRef = useRef<SeriesSelectBottomSheetRef>(null);

  const favoriteColorIds = useFavoritesStore((s) => s.favoriteColorIds);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

  const activeBrandId = useMemo(() => {
    if (selectedSeriesIds.size === allSeries.length && allSeries.length > 0) return ALL_BRAND_ID;
    for (const brand of brands) {
      const brandSeries = getSeriesWithCountByBrandId(brand.id);
      if (
        brandSeries.length > 0 &&
        brandSeries.length === selectedSeriesIds.size &&
        brandSeries.every((s) => selectedSeriesIds.has(s.id))
      ) return brand.id;
    }
    return null;
  }, [selectedSeriesIds, allSeries, brands]);

  const handleBrandChip = useCallback((brandId: string) => {
    if (brandId === ALL_BRAND_ID) {
      setSelectedSeriesIds(new Set(allSeries.map((s) => s.id)));
    } else {
      const brandSeries = getSeriesWithCountByBrandId(brandId);
      setSelectedSeriesIds(new Set(brandSeries.map((s) => s.id)));
    }
  }, [allSeries, setSelectedSeriesIds]);

  const filteredColors = useMemo(() => {
    let list = allColors;
    if (showOnlyFavorites) list = list.filter((c) => favoriteColorIds.includes(c.id));
    return filterColorsBySearch(list, searchQuery, i18n.language);
  }, [allColors, searchQuery, showOnlyFavorites, favoriteColorIds, i18n.language]);

  const handleFavorite = useCallback((color: Color) => toggleFavorite(color.id), [toggleFavorite]);

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

  const activeCount = selectedSeriesIds.size;
  const totalCount = allSeries.length;

  const listHeader = (
    <View>
      <SearchInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={t("catalog.searchPlaceholder")}
        clearAccessibilityLabel={t("common.clear")}
      />
      <View style={styles.chipRow}>
        <View style={styles.chipScrollWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipContent}
          >
            <BrandChip
              label="All"
              active={activeBrandId === ALL_BRAND_ID}
              onPress={() => handleBrandChip(ALL_BRAND_ID)}
            />
            {brands.map((brand) => (
              <BrandChip
                key={brand.id}
                label={brand.name}
                active={activeBrandId === brand.id}
                onPress={() => handleBrandChip(brand.id)}
              />
            ))}
          </ScrollView>
          <LinearGradient
            colors={["transparent", Surface.lowest]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.chipFade}
            pointerEvents="none"
          />
        </View>
        <TouchableOpacity
          style={[styles.filterChip, activeCount < totalCount && styles.filterChipActive]}
          onPress={() => seriesFilterSheetRef.current?.present()}
          accessibilityLabel={t("catalog.filterSeries")}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
        >
          <IconSymbol
            name="slider.horizontal.3"
            size={18}
            color={activeCount < totalCount ? Accent.primary : Accent.onSurfaceMuted}
          />
          {activeCount < totalCount && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <Screen>
        <View style={styles.container}>
          <ScreenHeader
            title={t("catalog.overviewTitle")}
            right={
              <TouchableOpacity
                onPress={() => setShowOnlyFavorites((s) => !s)}
                style={styles.favBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel={showOnlyFavorites ? t("catalog.showAllColors") : t("catalog.showOnlyFavorites")}
              >
                <IconSymbol
                  name={showOnlyFavorites ? "star.fill" : "star"}
                  size={22}
                  color={showOnlyFavorites ? Accent.primary : Accent.onSurfaceMuted}
                />
              </TouchableOpacity>
            }
          />
          <ColorGridList
            colors={filteredColors}
            renderCard={renderCard}
            ListHeaderComponent={listHeader}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </Screen>

      <ColorDetailBottomSheet
        ref={detailSheetRef}
        color={detailParams}
        isFavorite={detailParams ? favoriteColorIds.includes(detailParams.color.id) : false}
        onToggleFavorite={() => detailParams && handleFavorite(detailParams.color)}
        onOpenColor={openDetailSheet}
      />

      <SeriesSelectBottomSheet
        ref={seriesFilterSheetRef}
        series={allSeries}
        selectedSeriesIds={selectedSeriesIds}
        onToggleSeries={toggleSeriesSelection}
        onSelectAll={() => setSelectedSeriesIds(new Set(allSeries.map((s) => s.id)))}
        onClear={() => setSelectedSeriesIds(new Set())}
      />
    </>
  );
}

function BrandChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <ThemedText style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  favBtn: {
    padding: Spacing.xs,
  },
  chipRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  chipScrollWrap: {
    flex: 1,
    position: "relative",
  },
  chipContent: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  chipFade: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 32,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    backgroundColor: Surface.high,
  },
  chipActive: {
    backgroundColor: `${Accent.primary}22`,
  },
  chipText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: FontFamily.displayMedium,
    color: Accent.onSurfaceMuted,
  },
  chipTextActive: {
    color: Accent.primary,
  },
  filterChip: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.full,
    backgroundColor: Surface.high,
  },
  filterChipActive: {
    backgroundColor: `${Accent.primary}22`,
  },
  filterDot: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 7,
    height: 7,
    borderRadius: BorderRadius.full,
    backgroundColor: Accent.primary,
  },
  listContent: {
    paddingTop: COLOR_GRID.GAP,
    paddingBottom: Spacing.sm,
  },
});
