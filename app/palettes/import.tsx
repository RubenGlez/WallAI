import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { getColors } from "react-native-image-colors";

import { Button } from "@/components/button";
import { HeaderBackButton } from "@/components/header-back-button";
import { SaveNameModal } from "@/components/save-name-modal";
import {
  SeriesSelectBottomSheet,
  type SeriesSelectBottomSheetRef,
} from "@/components/series-select-bottom-sheet";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Accent, BorderRadius, FontFamily, Spacing, Surface, Typography } from "@/constants/theme";
import { getColorDisplayName } from "@/lib/color";
import { extractHexPalette, findClosestColors } from "@/lib/colorMatch";
import {
  getAllSeriesWithCount,
  getColorsBySeriesId,
} from "@/stores/useCatalogStore";
import { usePalettesStore } from "@/stores/usePalettesStore";
import type { Color } from "@/types";

export default function ImportFromImageScreen() {
  const { imageUri: imageUriParam } = useLocalSearchParams<{
    imageUri?: string;
  }>();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const addPalette = usePalettesStore((s) => s.addPalette);

  const allSeries = useMemo(() => getAllSeriesWithCount(), []);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [extractedHexes, setExtractedHexes] = useState<string[]>([]);
  const [selectedSeriesIds, setSelectedSeriesIds] = useState<Set<string>>(
    new Set(),
  );
  /** For each extracted hex, the catalog color id the user selected (optional). */
  const [selectedCatalogColorByHex, setSelectedCatalogColorByHex] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [paletteName, setPaletteName] = useState("");
  const seriesFilterSheetRef = useRef<SeriesSelectBottomSheetRef>(null);
  const hasInitializedSeriesSelection = useRef(false);
  const hasProcessedParamImage = useRef(false);

  /** Default: only the first series selected once catalog is available. */
  useEffect(() => {
    if (allSeries.length > 0 && !hasInitializedSeriesSelection.current) {
      hasInitializedSeriesSelection.current = true;
      setSelectedSeriesIds(new Set([allSeries[0].id]));
    }
  }, [allSeries]);

  const processImageUri = useCallback(async (uri: string) => {
    setImageUri(uri);
    const colorsResult = await getColors(uri, { fallback: "#000000" });
    const hexes = extractHexPalette(
      colorsResult as unknown as Record<string, string>,
    );
    setExtractedHexes(hexes);
    const series = getAllSeriesWithCount();
    setSelectedSeriesIds(
      new Set(series.length > 0 ? [series[0].id] : []),
    );
    setSelectedCatalogColorByHex({});
  }, []);

  /** When navigated with imageUri param (from FAB gallery/camera), process it and skip pick section. */
  useEffect(() => {
    if (!imageUriParam || hasProcessedParamImage.current) return;
    hasProcessedParamImage.current = true;
    setLoading(true);
    setError(null);
    processImageUri(imageUriParam).finally(() => setLoading(false));
  }, [imageUriParam, processImageUri]);

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setError(t("palettes.permissionDenied"));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.8,
      });
      if (result.canceled || !result.assets[0]) {
        setLoading(false);
        return;
      }
      await processImageUri(result.assets[0].uri);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  }, [t, processImageUri]);

  const takePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      setError(t("palettes.cameraPermissionDenied"));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      });
      if (result.canceled || !result.assets[0]) {
        setLoading(false);
        return;
      }
      await processImageUri(result.assets[0].uri);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  }, [t, processImageUri]);

  const toggleSeriesSelection = useCallback((seriesId: string) => {
    setSelectedSeriesIds((prev) => {
      const next = new Set(prev);
      if (next.has(seriesId)) next.delete(seriesId);
      else next.add(seriesId);
      return next;
    });
    setSelectedCatalogColorByHex({});
  }, []);

  const handleSelectAllSeries = useCallback(() => {
    setSelectedSeriesIds(new Set(allSeries.map((s) => s.id)));
    setSelectedCatalogColorByHex({});
  }, [allSeries]);

  const handleClearSeries = useCallback(() => {
    setSelectedSeriesIds(new Set());
    setSelectedCatalogColorByHex({});
  }, []);

  const selectCatalogColorForHex = useCallback(
    (hex: string, catalogColorId: string | null) => {
      setSelectedCatalogColorByHex((prev) => {
        if (catalogColorId == null) {
          const next = { ...prev };
          delete next[hex];
          return next;
        }
        const current = prev[hex];
        if (current === catalogColorId) {
          const next = { ...prev };
          delete next[hex];
          return next;
        }
        return { ...prev, [hex]: catalogColorId };
      });
    },
    [],
  );

  const catalogColorsForMatch = useMemo(() => {
    const seen = new Set<string>();
    const out: Color[] = [];
    for (const seriesId of selectedSeriesIds) {
      const colors = getColorsBySeriesId(seriesId);
      for (const c of colors) {
        if (!seen.has(c.id)) {
          seen.add(c.id);
          out.push(c);
        }
      }
    }
    return out;
  }, [selectedSeriesIds]);

  const selectedSeriesWithNames = useMemo(
    () => allSeries.filter((s) => selectedSeriesIds.has(s.id)),
    [allSeries, selectedSeriesIds],
  );

  /** For each extracted hex, up to 3 similar colors per selected series. */
  const similaritiesPerHex = useMemo(() => {
    if (extractedHexes.length === 0 || selectedSeriesWithNames.length === 0)
      return [];
    return extractedHexes.map((hex) => ({
      hex,
      bySeries: selectedSeriesWithNames.map((series) => ({
        seriesId: series.id,
        seriesName: series.name,
        matches: findClosestColors(hex, getColorsBySeriesId(series.id), 3),
      })),
    }));
  }, [extractedHexes, selectedSeriesWithNames]);

  const selectedColorsForPalette = useMemo(() => {
    return extractedHexes
      .map((hex) =>
        catalogColorsForMatch.find(
          (c) => c.id === selectedCatalogColorByHex[hex],
        ),
      )
      .filter((c): c is Color => c != null);
  }, [extractedHexes, catalogColorsForMatch, selectedCatalogColorByHex]);

  const handleSavePalette = useCallback(() => {
    if (selectedColorsForPalette.length === 0) return;
    setShowNameModal(true);
  }, [selectedColorsForPalette.length]);

  const handleConfirmSave = useCallback(() => {
    const name = paletteName.trim() || t("palettes.defaultPaletteName");
    addPalette({
      name,
      colors: selectedColorsForPalette,
    });
    setShowNameModal(false);
    setPaletteName("");
    router.replace("/(tabs)/palettes");
  }, [addPalette, paletteName, selectedColorsForPalette, t, router]);

  const hasImage = imageUri != null && extractedHexes.length > 0;
  const hasSeriesSelected = selectedSeriesIds.size > 0;
  const showEquivalents =
    hasImage && hasSeriesSelected && similaritiesPerHex.length > 0;

  return (
    <ThemedView style={styles.container} safeArea="top">
      <HeaderBackButton
        title={t("palettes.importFromImage")}
        right={
          <Button
            variant="ghost"
            size="icon"
            onPress={() => seriesFilterSheetRef.current?.present()}
            accessibilityLabel={t("palettes.selectSeries")}
            icon={
              <IconSymbol
                name="line.3.horizontal.decrease.circle.fill"
                size={24}
                color={Accent.primary}
              />
            }
          />
        }
      />
      <SeriesSelectBottomSheet
        ref={seriesFilterSheetRef}
        series={allSeries}
        selectedSeriesIds={selectedSeriesIds}
        onToggleSeries={toggleSeriesSelection}
        onSelectAll={handleSelectAllSeries}
        onClear={handleClearSeries}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!hasImage && !imageUriParam && (
          <View style={styles.pickSection}>
            <ThemedText
              style={[
                styles.pickSectionSubtitle,
                { color: Accent.onSurfaceMuted },
              ]}
            >
              {t("palettes.choosePhotoSubtitle")}
            </ThemedText>
            {loading ? (
              <View style={styles.pickLoadingWrap}>
                <ActivityIndicator size="large" color={Accent.primary} />
              </View>
            ) : (
              <View style={styles.pickButtonsRow}>
                <TouchableOpacity
                  style={[styles.pickOption, { backgroundColor: Surface.high }]}
                  onPress={pickImage}
                  activeOpacity={0.7}
                >
                  <IconSymbol
                    name="photo.on.rectangle.angled"
                    size={32}
                    color={Accent.primary}
                    style={styles.pickOptionIcon}
                  />
                  <ThemedText style={styles.pickOptionTitle}>
                    {t("palettes.selectFromGallery")}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.pickOption, { backgroundColor: Surface.high }]}
                  onPress={takePhoto}
                  activeOpacity={0.7}
                >
                  <IconSymbol
                    name="camera.fill"
                    size={32}
                    color={Accent.primary}
                    style={styles.pickOptionIcon}
                  />
                  <ThemedText style={styles.pickOptionTitle}>
                    {t("palettes.takePhoto")}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {!hasImage && imageUriParam && loading && (
          <View style={styles.pickLoadingWrap}>
            <ActivityIndicator size="large" color={Accent.primary} />
          </View>
        )}

        {error && (
          <ThemedText style={[styles.error, { color: Accent.error }]}>
            {error}
          </ThemedText>
        )}

        {hasImage && (
          <>
            <View style={styles.thumbnailWrap}>
              <Image
                source={{ uri: imageUri! }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
              <View style={styles.swatchRow}>
                {extractedHexes.map((hex) => (
                  <View
                    key={hex}
                    style={[
                      styles.miniSwatch,
                      { backgroundColor: hex },
                      (hex === "#ffffff" || hex.startsWith("#fff")) && {
                        borderWidth: 1,
                        borderColor: `${Accent.outlineVariant}30`,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>

            {showEquivalents && (
              <>
                <ThemedText
                  style={[styles.sectionLabel, { color: Accent.onSurfaceMuted }]}
                >
                  {t("palettes.equivalents")}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.sectionSubtitle,
                    { color: Accent.onSurfaceMuted },
                  ]}
                >
                  {t("palettes.selectMatchPerColor")}
                </ThemedText>
                {similaritiesPerHex.map(({ hex, bySeries }) => {
                  const selectedId = selectedCatalogColorByHex[hex];
                  return (
                    <View key={hex} style={styles.extractedColorBlock}>
                      <View style={styles.extractedColorHeader}>
                        <View
                          style={[
                            styles.originalSwatch,
                            { backgroundColor: hex },
                          ]}
                        />
                        <ThemedText style={styles.extractedHexLabel}>
                          {hex.toUpperCase()}
                        </ThemedText>
                      </View>
                      {bySeries.map(({ seriesId, seriesName, matches }, seriesIndex) => (
                        <View
                          key={seriesId}
                          style={[
                            styles.seriesMatchesSection,
                            seriesIndex > 0 && styles.seriesMatchesSeparator,
                          ]}
                        >
                          <View style={styles.seriesMatchesLabelWrap}>
                            <ThemedText
                              style={[
                                styles.seriesMatchesLabel,
                                { color: Accent.onSurfaceMuted },
                              ]}
                              numberOfLines={1}
                            >
                              {seriesName}
                            </ThemedText>
                          </View>
                          {matches.map((match) => {
                            const name = getColorDisplayName(
                              match.catalogColor,
                              i18n.language,
                            );
                            const isSelected = selectedId === match.catalogColor.id;
                            return (
                              <TouchableOpacity
                                key={match.catalogColor.id}
                                style={[
                                  styles.similarRow,
                                  isSelected && styles.similarRowSelected,
                                ]}
                                onPress={() =>
                                  selectCatalogColorForHex(
                                    hex,
                                    isSelected ? null : match.catalogColor.id,
                                  )
                                }
                                activeOpacity={0.7}
                                accessibilityRole="radio"
                                accessibilityState={{ checked: isSelected }}
                              >
                                <View
                                  style={[
                                    styles.matchSwatch,
                                    { backgroundColor: match.catalogColor.hex },
                                  ]}
                                />
                                <View style={styles.matchInfo}>
                                  <ThemedText
                                    style={styles.matchName}
                                    numberOfLines={1}
                                  >
                                    {name}
                                  </ThemedText>
                                  <ThemedText
                                    style={[
                                      styles.matchCode,
                                      { color: Accent.onSurfaceMuted },
                                    ]}
                                  >
                                    {match.catalogColor.code}
                                  </ThemedText>
                                </View>
                                <ThemedText
                                  style={[
                                    styles.similarity,
                                    { color: Accent.primary },
                                  ]}
                                >
                                  {match.similarity}%
                                </ThemedText>
                                {isSelected ? (
                                  <IconSymbol
                                    name="checkmark.circle.fill"
                                    size={24}
                                    color={Accent.primary}
                                  />
                                ) : (
                                  <IconSymbol
                                    name="circle"
                                    size={24}
                                    color={Accent.onSurfaceMuted}
                                  />
                                )}
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      ))}
                    </View>
                  );
                })}

                <View style={styles.footerActions}>
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onPress={handleSavePalette}
                    disabled={selectedColorsForPalette.length === 0}
                  >
                    {t("palettes.savePalette")}
                  </Button>
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>

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
    paddingHorizontal: Spacing.md,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  pickSection: {
    marginBottom: Spacing.md,
  },
  pickSectionSubtitle: {
    fontSize: Typography.fontSize.sm,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  pickLoadingWrap: {
    minHeight: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  pickButtonsRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  pickOption: {
    flex: 1,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 140,
  },
  pickOptionIcon: {
    marginBottom: Spacing.sm,
  },
  pickOptionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: "center",
    color: Accent.onSurface,
  },
  error: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.sm,
  },
  thumbnailWrap: {
    marginBottom: Spacing.lg,
  },
  thumbnail: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  swatchRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  miniSwatch: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: Typography.letterSpacing.label,
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    color: Accent.onSurfaceMuted,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.md,
    color: Accent.onSurfaceMuted,
  },
  extractedColorBlock: {
    backgroundColor: Surface.base,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  extractedColorHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Surface.high,
    gap: Spacing.sm,
  },
  originalSwatch: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
  },
  extractedHexLabel: {
    fontFamily: FontFamily.displayMedium,
    fontSize: Typography.fontSize.sm,
    letterSpacing: Typography.letterSpacing.label,
    color: Accent.onSurfaceMuted,
  },
  seriesMatchesSection: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  seriesMatchesSeparator: {
    marginTop: Spacing.xs,
    backgroundColor: Surface.high,
    paddingTop: Spacing.sm,
  },
  seriesMatchesLabelWrap: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  seriesMatchesLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    letterSpacing: Typography.letterSpacing.label,
    textTransform: "uppercase",
  },
  similarRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  similarRowSelected: {
    backgroundColor: Surface.bright,
  },
  matchSwatch: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  matchCode: {
    fontSize: Typography.fontSize.sm,
  },
  similarity: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  footerActions: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
});
