import { ColorDetailModal } from "@/components/color-detail-modal";
import { FilterDropdown } from "@/components/filter-dropdown";
import { PaletteSelector, PaletteSelectorRef } from "@/components/palette-selector";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
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
  TextInput,
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
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  // Subscribe to palette changes to trigger re-renders
  const activePalette = usePaletteStore((state) => state.getActivePalette());
  const addColor = usePaletteStore((state) => state.addColor);
  const removeColor = usePaletteStore((state) => state.removeColor);
  const inPalette = activePalette?.colors.some((c) => c.id === color.id) ?? false;
  const hasActivePalette = activePalette !== null;

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
                : { backgroundColor: theme.background, borderWidth: 2, borderColor: theme.border },
            ]}
            onPress={handleBadgePress}
            activeOpacity={0.8}
          >
            {inPalette ? (
              <ThemedText style={styles.paletteBadgeText}>✓</ThemedText>
            ) : (
              <IconSymbol
                name="plus"
                size={16}
                color={theme.text}
              />
            )}
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.colorInfo}>
        <ThemedText style={styles.colorCode} numberOfLines={1}>
          {color.code}
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
  const [selectedColor, setSelectedColor] =
    useState<ColorWithTranslations | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const paletteSelectorRef = useRef<PaletteSelectorRef>(null);
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
            name?.toLowerCase().includes(query)
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
              <View style={styles.headerText}>
                <ThemedText type="title" style={styles.title}>
                  {t("colors.title")}
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                  {t("colors.subtitle", { count: filteredColors.length })}
                </ThemedText>
              </View>
              <TouchableOpacity
                style={styles.paletteButton}
                onPress={() => paletteSelectorRef.current?.open()}
              >
                <IconSymbol
                  name="square.grid.2x2.fill"
                  size={24}
                  color={theme.tint}
                />
              </TouchableOpacity>
            </View>
            {/* Search Box with Filter Button */}
            <View style={styles.searchRow}>
              <View style={[styles.searchContainer, { 
                borderColor: theme.border,
                backgroundColor: theme.backgroundSecondary,
              }]}>
                <IconSymbol
                  name="magnifyingglass"
                  size={20}
                  color={theme.textSecondary}
                  style={styles.searchIcon}
                />
                <TextInput
                  style={[styles.searchInput, { color: theme.text }]}
                  placeholder={t("colors.searchPlaceholder")}
                  placeholderTextColor={theme.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery("")}
                    style={styles.clearButton}
                  >
                    <IconSymbol
                      name="xmark.circle.fill"
                      size={20}
                      color={theme.textSecondary}
                    />
                  </TouchableOpacity>
                )}
              </View>
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

      <ColorDetailModal
        bottomSheetRef={bottomSheetRef}
        color={selectedColor}
        onClose={handleCloseModal}
      />

      <PaletteSelector ref={paletteSelectorRef} />
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
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  headerText: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  paletteButton: {
    padding: Spacing.xs,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 40,
    minHeight: 40,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    opacity: 0.7,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: "transparent",
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    padding: 0,
  },
  clearButton: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
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
});
