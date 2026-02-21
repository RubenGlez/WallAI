import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "expo-router";
import React, {
  useCallback,
  useEffect,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ColorDetailBottomSheet,
  type ColorDetailBottomSheetRef,
  type ColorDetailParams,
} from "@/components/color-detail-bottom-sheet";
import { Button } from "@/components/button";
import { ColorGridCard } from "@/components/color-grid-card";
import {
  SeriesSelectBottomSheet,
  type SeriesSelectBottomSheetRef,
} from "@/components/series-select-bottom-sheet";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  getAllSeriesWithCount,
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

function getColorDisplayName(color: Color, language: string): string {
  const lang = language.split("-")[0];
  const names = color.name;
  if (!names || typeof names !== "object") return color.code;
  const forLang = names[lang as keyof typeof names];
  if (forLang) return forLang;
  const first = Object.values(names)[0];
  return typeof first === "string" ? first : color.code;
}

export default function ColorsOverviewScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const allSeries = useMemo(() => getAllSeriesWithCount(), []);
  const [selectedSeriesIds, setSelectedSeriesIds] = useState<Set<string>>(
    new Set(),
  );
  const hasInitializedSeriesSelection = useRef(false);

  useEffect(() => {
    if (allSeries.length > 0 && !hasInitializedSeriesSelection.current) {
      hasInitializedSeriesSelection.current = true;
      const firstSeriesId = allSeries[0].id;
      setSelectedSeriesIds(new Set([firstSeriesId]));
    }
  }, [allSeries]);

  const toggleSeriesSelection = useCallback((seriesId: string) => {
    setSelectedSeriesIds((prev) => {
      const next = new Set(prev);
      if (next.has(seriesId)) next.delete(seriesId);
      else next.add(seriesId);
      return next;
    });
  }, []);

  const allColors = useMemo(() => {
    const out: Color[] = [];
    for (const seriesId of selectedSeriesIds) {
      out.push(...getColorsBySeriesId(seriesId));
    }
    return out;
  }, [selectedSeriesIds]);

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
    if (!searchQuery.trim()) return list;
    const q = searchQuery.trim().toLowerCase();
    return list.filter((c) => {
      const name = getColorDisplayName(c, i18n.language);
      return c.code.toLowerCase().includes(q) || name.toLowerCase().includes(q);
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
      headerShown: true,
      title: t("colors.overviewTitle"),
      headerStyle: {
        paddingTop: insets.top,
        borderBottomWidth: 0,
      },
      headerShadowVisible: false,
      headerRight: () => (
        <View style={styles.headerRightRow}>
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
          <Button
            variant="ghost"
            size="icon"
            onPress={() => seriesFilterSheetRef.current?.present()}
            accessibilityLabel={t("palettes.selectSeries")}
            icon={<MaterialIcons name="filter-list" size={24} color={theme.tint} />}
          />
        </View>
      ),
    });
  }, [navigation, insets.top, showOnlyFavorites, theme.tint, theme.icon, t]);

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
        brandName: brand?.name ?? "—",
        seriesName: s?.name ?? "—",
      });
      detailSheetRef.current?.present();
    },
    [i18n.language],
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

      <SeriesSelectBottomSheet
        ref={seriesFilterSheetRef}
        series={allSeries}
        selectedSeriesIds={selectedSeriesIds}
        onToggleSeries={toggleSeriesSelection}
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
  headerRightRow: {
    flexDirection: "row",
    alignItems: "center",
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
