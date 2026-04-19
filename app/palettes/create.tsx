import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Switch, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import { ColorGridCard } from "@/components/color-grid-card";
import { ColorGridList } from "@/components/color-grid-list";
import { HeaderBackButton } from "@/components/header-back-button";
import { SaveNameModal } from "@/components/save-name-modal";
import { SearchInput } from "@/components/search-input";
import {
  SeriesSelectBottomSheet,
  type SeriesSelectBottomSheetRef,
} from "@/components/series-select-bottom-sheet";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { COLOR_GRID } from "@/constants/color-grid";
import { LinearGradient } from "expo-linear-gradient";

import { Accent, Spacing, Surface, Typography } from "@/constants/theme";
import { useSeriesColorSelection } from "@/hooks/use-series-color-selection";
import { filterColorsBySearch, getColorDisplayName } from "@/lib/color";
import { confirmDelete } from "@/lib/confirm-delete";
import { usePalettesStore } from "@/stores/usePalettesStore";
import type { Color } from "@/types";

const { GAP, HORIZONTAL_PADDING } = COLOR_GRID;

export default function CreatePaletteScreen() {
  const { paletteId, initialColorIds } = useLocalSearchParams<{
    paletteId?: string;
    initialColorIds?: string;
  }>();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const {
    allSeries,
    selectedSeriesIds,
    setSelectedSeriesIds,
    toggleSeriesSelection,
    allColors,
  } = useSeriesColorSelection();

  const addPalette = usePalettesStore((s) => s.addPalette);
  const updatePalette = usePalettesStore((s) => s.updatePalette);
  const getPalette = usePalettesStore((s) => s.getPalette);
  const removePalette = usePalettesStore((s) => s.removePalette);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColors, setSelectedColors] = useState<Color[]>([]);
  const [showNameModal, setShowNameModal] = useState(false);
  const [paletteName, setPaletteName] = useState("");
  const [showOnlySelected, setShowOnlySelected] = useState(!!paletteId);
  const seriesFilterSheetRef = useRef<SeriesSelectBottomSheetRef>(null);
  const initialAppliedRef = useRef(false);

  // Edit palette: load series and selected colors from palette
  useEffect(() => {
    if (!paletteId) return;
    const palette = getPalette(paletteId);
    if (!palette) return;
    const seriesIds = new Set(palette.colors.map((c) => c.seriesId));
    setSelectedSeriesIds(seriesIds);
    setSelectedColors(palette.colors);
    initialAppliedRef.current = true;
  }, [paletteId, getPalette, setSelectedSeriesIds]);

  // Legacy: initialColorIds without paletteId (e.g. deep link)
  useEffect(() => {
    if (
      initialAppliedRef.current ||
      !initialColorIds ||
      allColors.length === 0 ||
      paletteId
    )
      return;
    initialAppliedRef.current = true;
    const ids = new Set(initialColorIds.split(",").filter(Boolean));
    setSelectedColors(allColors.filter((c) => ids.has(c.id)));
  }, [initialColorIds, allColors, paletteId]);

  const handleDeletePalette = useCallback(() => {
    if (!paletteId) return;
    confirmDelete({
      title: t("projects.removePaletteTitle"),
      message: t("projects.removePaletteMessage"),
      confirmLabel: t("projects.remove"),
      cancelLabel: t("common.cancel"),
      onConfirm: () => {
        removePalette(paletteId);
        router.replace("/(tabs)/palettes");
      },
    });
  }, [paletteId, removePalette, router, t]);

  const headerTitle = useMemo(() => {
    if (!paletteId) return t("palettes.exploreColorsTitle");
    const palette = getPalette(paletteId);
    return palette?.name?.trim() || t("palettes.exploreColorsTitle");
  }, [paletteId, getPalette, t]);

  const filteredColors = useMemo(
    () => filterColorsBySearch(allColors, searchQuery, i18n.language),
    [allColors, searchQuery, i18n.language],
  );

  const listData = useMemo(() => {
    if (showOnlySelected && selectedColors.length > 0) {
      return filterColorsBySearch(selectedColors, searchQuery, i18n.language);
    }
    return filteredColors;
  }, [
    showOnlySelected,
    selectedColors,
    filteredColors,
    searchQuery,
    i18n.language,
  ]);

  const selectedIds = useMemo(
    () => new Set(selectedColors.map((c) => c.id)),
    [selectedColors],
  );

  const toggleColorInPalette = useCallback((color: Color) => {
    setSelectedColors((prev) => {
      const has = prev.some((c) => c.id === color.id);
      if (has) return prev.filter((c) => c.id !== color.id);
      return [...prev, color];
    });
  }, []);

  const handleSave = useCallback(() => {
    if (selectedColors.length === 0) return;
    if (paletteId) {
      const palette = getPalette(paletteId);
      setPaletteName(palette?.name ?? "");
    } else {
      setPaletteName("");
    }
    setShowNameModal(true);
  }, [selectedColors.length, paletteId, getPalette]);

  const handleConfirmSave = useCallback(() => {
    const name = paletteName.trim() || t("palettes.defaultPaletteName");
    if (paletteId) {
      updatePalette(paletteId, { name, colors: selectedColors });
    } else {
      addPalette({ name, colors: selectedColors });
    }
    setShowNameModal(false);
    setPaletteName("");
    router.replace("/(tabs)/palettes");
  }, [
    addPalette,
    updatePalette,
    paletteId,
    paletteName,
    selectedColors,
    t,
    router,
  ]);

  const renderCard = useCallback(
    (item: Color) => (
      <ColorGridCard
        color={item}
        displayName={getColorDisplayName(item, i18n.language)}
        onPress={() => toggleColorInPalette(item)}
        isInPalette={selectedIds.has(item.id)}
        selectionMode
        cardWidth={COLOR_GRID.CARD_WIDTH}
        swatchSize={COLOR_GRID.SWATCH_SIZE}
      />
    ),
    [i18n.language, selectedIds, toggleColorInPalette],
  );

  return (
    <ThemedView style={styles.container} safeArea="top">
      <HeaderBackButton
        title={headerTitle}
        right={
          <View style={styles.headerRightRow}>
            {paletteId ? (
              <Button
                variant="ghost"
                size="icon"
                onPress={handleDeletePalette}
                accessibilityLabel={t("projects.remove")}
                icon={<IconSymbol name="trash" size={22} color={Accent.error} />}
              />
            ) : null}
            <Button
              variant="ghost"
              size="icon"
              onPress={() => seriesFilterSheetRef.current?.present()}
              accessibilityLabel={t("palettes.selectSeries")}
              icon={
                <IconSymbol
                  name="line.3.horizontal.decrease.circle.fill"
                  size={22}
                  color={Accent.primary}
                />
              }
            />
          </View>
        }
      />
      <SeriesSelectBottomSheet
        ref={seriesFilterSheetRef}
        series={allSeries}
        selectedSeriesIds={selectedSeriesIds}
        onToggleSeries={toggleSeriesSelection}
        onSelectAll={() =>
          setSelectedSeriesIds(new Set(allSeries.map((s) => s.id)))
        }
        onClear={() => setSelectedSeriesIds(new Set())}
      />

      <SearchInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={t("colors.searchPlaceholder")}
        clearAccessibilityLabel={t("common.clear")}
      />

      <ColorGridList
        colors={listData}
        renderCard={renderCard}
        contentContainerStyle={styles.listContent}
      />

      <LinearGradient
        colors={["transparent", Surface.lowest]}
        style={styles.footerGradient}
        pointerEvents="box-none"
      >
        <View
          style={[styles.footerContent, { paddingBottom: Spacing.md + insets.bottom }]}
          pointerEvents="box-none"
        >
          <View style={styles.footerActionsRow}>
            <View style={styles.switchWrap}>
              <Switch
                value={showOnlySelected}
                onValueChange={setShowOnlySelected}
                trackColor={{ false: Accent.outlineVariant, true: `${Accent.primary}60` }}
                thumbColor={showOnlySelected ? Accent.primary : Accent.onSurfaceMuted}
              />
              <ThemedText style={[styles.switchLabel, { color: Accent.onSurfaceMuted }]}>
                {t("colors.colorCount", { count: selectedColors.length })}
              </ThemedText>
            </View>
            <Button
              variant="primary"
              size="md"
              fullWidth
              onPress={handleSave}
              disabled={selectedColors.length === 0}
            >
              {t("palettes.savePalette")}
            </Button>
          </View>
        </View>
      </LinearGradient>

      <SaveNameModal
        visible={showNameModal}
        onRequestClose={() => setShowNameModal(false)}
        title={t("palettes.nameYourPalette")}
        placeholder={t("palettes.paletteNamePlaceholder")}
        value={paletteName}
        onChangeText={setPaletteName}
        onCancel={() => setShowNameModal(false)}
        onConfirm={handleConfirmSave}
        cancelLabel={t("common.cancel")}
        saveLabel={t("common.save")}
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
  listContent: {
    paddingTop: GAP,
    paddingBottom: 160,
  },
  footerGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: Spacing.xxl,
  },
  footerContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  footerActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  switchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  switchLabel: {
    fontSize: Typography.fontSize.sm,
  },
});
