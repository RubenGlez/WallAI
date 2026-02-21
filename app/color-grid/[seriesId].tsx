import { useLocalSearchParams, useNavigation } from "expo-router";
import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { Button } from "@/components/button";
import {
  ColorDetailBottomSheet,
  type ColorDetailBottomSheetRef,
  type ColorDetailParams,
} from "@/components/color-detail-bottom-sheet";
import { ColorGridCard } from "@/components/color-grid-card";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getColorDisplayName } from "@/lib/color";
import {
  getBrandById,
  getColorsBySeriesId,
  getSeriesById,
} from "@/stores/useCatalogStore";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import type { Color } from "@/types";

const { width } = Dimensions.get("window");
const NUM_COLUMNS = 3;
const GAP = Spacing.sm;
const HORIZONTAL_PADDING = Spacing.md;
const CARD_WIDTH =
  (width - HORIZONTAL_PADDING * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
const SWATCH_SIZE = CARD_WIDTH;

export default function ColorGridScreen() {
  const { seriesId } = useLocalSearchParams<{ seriesId: string }>();
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

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
    if (!searchQuery.trim()) return list;
    const q = searchQuery.trim().toLowerCase();
    return list.filter((c) => {
      const name = getColorDisplayName(c, i18n.language);
      return (
        c.code.toLowerCase().includes(q) || name.toLowerCase().includes(q)
      );
    });
  }, [
    allColors,
    searchQuery,
    showOnlyFavorites,
    favoriteColorIds,
    i18n.language,
  ]);

  useLayoutEffect(() => {
    navigation.setOptions({
      ...(series ? { title: series.name } : {}),
      headerRight: () => (
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
      ),
    });
  }, [navigation, series, showOnlyFavorites, theme.tint, theme.icon, t]);

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
          marginRight:
            index % NUM_COLUMNS === NUM_COLUMNS - 1 ? 0 : GAP,
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
    <ThemedView style={styles.container}>
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
      />

      <View style={styles.searchWrap}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.backgroundSecondary,
              borderColor: theme.border,
              color: theme.text,
            },
          ]}
          placeholder={t("colors.searchPlaceholder")}
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            style={styles.searchClearBtn}
            onPress={() => setSearchQuery("")}
            accessibilityLabel={t("common.clear")}
            icon={
              <IconSymbol
                name="xmark.circle.fill"
                size={22}
                color={theme.textSecondary}
              />
            }
          />
        )}
      </View>

      <FlatList
        data={filteredColors}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={NUM_COLUMNS}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  searchWrap: {
    position: "relative",
    marginBottom: Spacing.md,
  },
  searchInput: {
    height: 44,
    paddingHorizontal: Spacing.md,
    paddingRight: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: Typography.fontSize.md,
  },
  searchClearBtn: {
    position: "absolute",
    right: Spacing.sm,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    padding: Spacing.xs,
  },
  listContent: {
    paddingTop: GAP,
    paddingBottom: Spacing.xl,
  },
  row: {
    flexDirection: "row",
    marginBottom: GAP,
  },
});
