import { ColorDetailModal } from "@/components/color-detail-modal";
import { FilterDropdown } from "@/components/filter-dropdown";
import {
  PaletteCreator,
  PaletteCreatorRef,
} from "@/components/palette-creator";
import {
  PaletteSelector,
  PaletteSelectorRef,
} from "@/components/palette-selector";
import { SearchBar } from "@/components/search-bar";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import i18n from "@/i18n";
import { useColorsStore } from "@/stores/useColorsStore";
import { usePaletteStore } from "@/stores/usePaletteStore";
import { ColorWithTranslations } from "@/types";
import BottomSheet from "@gorhom/bottom-sheet";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const NUM_COLUMNS = 3;
const GAP = Spacing.sm;
const ITEM_SIZE =
  (width - Spacing.md * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

interface ColorItemProps {
  color: ColorWithTranslations;
  onPress: () => void;
}

function ColorItem({ color, onPress }: ColorItemProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  // Subscribe to palette changes to trigger re-renders
  const activePalette = usePaletteStore((state) => state.getActivePalette());
  const addColor = usePaletteStore((state) => state.addColor);
  const removeColor = usePaletteStore((state) => state.removeColor);
  const inPalette =
    activePalette?.colors.some((c) => c.id === color.id) ?? false;
  const hasActivePalette = activePalette !== null;

  // Get color name in current language, fallback to English, then code, then unknown
  const displayName = (() => {
    const currentLang = i18n.language as "en" | "es" | "de" | "fr" | "pt";
    const translations = color.translations;

    if (translations?.[currentLang]) {
      return translations[currentLang];
    }
    if (translations?.en) {
      return translations.en;
    }
    if (color.code) {
      return color.code;
    }
    return t("common.unknown");
  })().toUpperCase();

  const handleBadgePress = () => {
    if (!hasActivePalette) return;

    if (inPalette) {
      removeColor(color.id);
    } else {
      addColor(color);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.colorItem,
        {
          width: ITEM_SIZE,
          height: ITEM_SIZE,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.colorSwatch,
          { backgroundColor: color.hex },
          inPalette && styles.colorSwatchInPalette,
        ]}
      >
        {hasActivePalette && (
          <TouchableOpacity
            style={[
              styles.paletteBadge,
              inPalette
                ? { backgroundColor: Colors.light.success }
                : {
                    backgroundColor: theme.background,
                    borderWidth: 2,
                    borderColor: theme.border,
                  },
            ]}
            onPress={handleBadgePress}
            activeOpacity={0.8}
          >
            {inPalette ? (
              <ThemedText style={styles.paletteBadgeText}>✓</ThemedText>
            ) : (
              <IconSymbol name="plus" size={16} color={theme.text} />
            )}
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.colorInfo}>
        <ThemedText style={styles.colorCode} numberOfLines={1}>
          {displayName}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

export default function ColorsScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const {
    colorsWithTranslations,
    isLoading,
    loadColors,
    getColorsByBrandId,
    getColorsBySeriesId,
  } = useColorsStore();
  const activePalette = usePaletteStore((state) => state.getActivePalette());
  const clearActivePalette = usePaletteStore(
    (state) => state.clearActivePalette,
  );
  const [selectedColor, setSelectedColor] =
    useState<ColorWithTranslations | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const paletteSelectorRef = useRef<PaletteSelectorRef>(null);
  const paletteCreatorRef = useRef<PaletteCreatorRef>(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (colorsWithTranslations.length === 0) {
      loadColors();
    }
  }, [colorsWithTranslations.length, loadColors]);

  // Filter colors based on selected brand, series, and search query
  const filteredColors = useMemo(() => {
    let filtered = colorsWithTranslations;

    // Apply brand/series filters first
    if (selectedSeriesId) {
      filtered = getColorsBySeriesId(selectedSeriesId);
    } else if (selectedBrandId) {
      filtered = getColorsByBrandId(selectedBrandId);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((color) => {
        // Search by code
        if (color.code.toLowerCase().includes(query)) {
          return true;
        }

        // Search by name in all available languages
        const translations = color.translations;
        if (translations) {
          return Object.values(translations).some((name) =>
            name?.toLowerCase().includes(query),
          );
        }

        return false;
      });
    }

    return filtered;
  }, [
    colorsWithTranslations,
    selectedBrandId,
    selectedSeriesId,
    searchQuery,
    getColorsByBrandId,
    getColorsBySeriesId,
  ]);

  const handleColorPress = (color: ColorWithTranslations) => {
    setSelectedColor(color);
    bottomSheetRef.current?.expand();
  };

  const handleCloseModal = () => {
    bottomSheetRef.current?.close();
    setSelectedColor(null);
  };

  const handleBrandPress = (brandId: string | null) => {
    setSelectedBrandId(brandId);
    setSelectedSeriesId(null); // Reset series when brand changes
  };

  const handleSeriesPress = (seriesId: string | null) => {
    setSelectedSeriesId(seriesId);
  };

  const clearFilters = () => {
    setSelectedBrandId(null);
    setSelectedSeriesId(null);
  };

  if (isLoading && colorsWithTranslations.length === 0) {
    return (
      <ThemedView style={styles.container} safeArea="top">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.tint} />
          <ThemedText style={styles.loadingText}>
            {t("colors.loading")}
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const hasActiveFilters =
    selectedBrandId !== null || selectedSeriesId !== null;

  return (
    <>
      <FilterDropdown
        open={filterDrawerOpen}
        onOpen={() => setFilterDrawerOpen(true)}
        onClose={() => setFilterDrawerOpen(false)}
        selectedBrandId={selectedBrandId}
        selectedSeriesId={selectedSeriesId}
        onBrandSelect={handleBrandPress}
        onSeriesSelect={handleSeriesPress}
        onClearFilters={clearFilters}
      >
        <ThemedView style={styles.container} safeArea="top">
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerTitleRow}>
                <ThemedText type="title" style={styles.title}>
                  {t("colors.title")}
                </ThemedText>
              </View>
              <TouchableOpacity
                style={styles.paletteButton}
                onPress={() => paletteSelectorRef.current?.open()}
              >
                <IconSymbol name="swatchpalette" size={24} color={theme.tint} />
              </TouchableOpacity>
            </View>

            {activePalette && activePalette.colors.length > 0 && (
              <View
                style={[
                  styles.paletteSummary,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.backgroundSecondary,
                  },
                ]}
              >
                <View style={styles.paletteSummaryHeader}>
                  <ThemedText
                    style={styles.paletteSummaryName}
                    numberOfLines={1}
                  >
                    {activePalette.name}
                  </ThemedText>
                  <View style={styles.paletteSummaryRight}>
                    <ThemedText style={styles.paletteSummaryCount}>
                      {activePalette.colors.length}
                    </ThemedText>
                    <TouchableOpacity
                      onPress={clearActivePalette}
                      style={styles.paletteSummaryClearButton}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <IconSymbol
                        name="xmark.circle.fill"
                        size={16}
                        color={theme.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.paletteColorsRow}>
                  {activePalette.colors.slice(0, 12).map((c) => (
                    <View
                      key={c.id}
                      style={[
                        styles.paletteColorSwatch,
                        { backgroundColor: c.hex },
                      ]}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Search Box with Filter Button */}
            <View style={styles.searchRow}>
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t("colors.searchPlaceholder")}
              />
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setFilterDrawerOpen(true)}
              >
                <IconSymbol
                  name="line.3.horizontal.decrease.circle.fill"
                  size={24}
                  color={hasActiveFilters ? theme.tint : theme.text}
                />
              </TouchableOpacity>
            </View>
          </View>

          <FlatList
            data={filteredColors}
            renderItem={({ item }) => (
              <ColorItem color={item} onPress={() => handleColorPress(item)} />
            )}
            keyExtractor={(item) => item.id}
            numColumns={NUM_COLUMNS}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>
                  {t("colors.empty")}
                </ThemedText>
              </View>
            }
          />
        </ThemedView>
      </FilterDropdown>

      {/* Floating button to open palette bottom sheet */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: theme.tint,
          },
        ]}
        onPress={() => paletteCreatorRef.current?.open()}
        activeOpacity={0.8}
      >
        <IconSymbol name="plus" size={28} color={theme.background} />
      </TouchableOpacity>

      <ColorDetailModal
        bottomSheetRef={bottomSheetRef}
        color={selectedColor}
        onClose={handleCloseModal}
      />

      <PaletteSelector ref={paletteSelectorRef} />
      <PaletteCreator ref={paletteCreatorRef} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.sm,
    flexShrink: 1,
  },
  paletteButton: {
    padding: Spacing.xs,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 40,
    minHeight: 40,
  },
  title: {
    marginBottom: 0,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  searchContainer: {
    flex: 1,
  },
  paletteSummary: {
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
  },
  paletteSummaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  paletteSummaryName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    flex: 1,
    marginRight: Spacing.sm,
  },
  paletteSummaryRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  paletteSummaryCount: {
    fontSize: Typography.fontSize.xs,
    opacity: 0.7,
  },
  paletteSummaryClearButton: {
    marginLeft: Spacing.xs,
    padding: Spacing.xs,
  },
  paletteColorsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  paletteColorSwatch: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.full,
    marginRight: -4,
  },
  filterButton: {
    padding: Spacing.xs,
  },
  listContent: {
    padding: Spacing.md,
    paddingTop: Spacing.sm,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: GAP,
  },
  colorItem: {
    marginBottom: GAP,
  },
  colorSwatch: {
    width: "100%",
    height: ITEM_SIZE - 30,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
    position: "relative",
    overflow: "hidden",
  },
  colorSwatchInPalette: {
    borderWidth: 2,
    borderColor: Colors.light.success,
  },
  paletteBadge: {
    position: "absolute",
    top: Spacing.xs,
    right: Spacing.xs,
    borderRadius: BorderRadius.full,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  paletteBadgeText: {
    color: "#FFFFFF",
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  colorInfo: {
    paddingHorizontal: Spacing.xs,
  },
  colorCode: {
    fontSize: Typography.fontSize.xs,
    opacity: 0.8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: Spacing.md,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    opacity: 0.7,
  },
  fab: {
    position: "absolute",
    right: Spacing.lg,
    bottom: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
});
