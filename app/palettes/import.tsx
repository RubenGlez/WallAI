import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
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
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getColorDisplayName } from "@/lib/color";
import { extractHexPalette, findClosestColors } from "@/lib/colorMatch";
import {
  getAllSeriesWithCount,
  getColorsBySeriesId,
} from "@/stores/useCatalogStore";
import { usePalettesStore } from "@/stores/usePalettesStore";
import type { Color, SeriesWithCountAndBrand } from "@/types";

export default function ImportFromImageScreen() {
  const { imageUri: imageUriParam } = useLocalSearchParams<{
    imageUri?: string;
  }>();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
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
  const seriesFilterSheetRef = useRef<BottomSheetModal>(null);
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

  const renderSeriesSheetBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
      />
    ),
    [],
  );

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
                color={theme.tint}
              />
            }
          />
        }
      />
      <BottomSheetModal
        ref={seriesFilterSheetRef}
        snapPoints={["60%", "90%"]}
        backgroundStyle={{
          backgroundColor: theme.background,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
        backdropComponent={renderSeriesSheetBackdrop}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.seriesSheetContent}
        >
          <ThemedText
            style={[styles.sectionLabel, { color: theme.textSecondary }]}
          >
            {t("palettes.selectSeries")}
          </ThemedText>
          <ThemedText
            style={[styles.sectionSubtitle, { color: theme.textSecondary }]}
          >
            {t("palettes.selectSeriesSubtitle")}
          </ThemedText>
          <View style={styles.seriesList}>
            {allSeries.map((s: SeriesWithCountAndBrand) => {
              const isSelected = selectedSeriesIds.has(s.id);
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[
                    styles.seriesRow,
                    { borderBottomColor: theme.border },
                  ]}
                  onPress={() => toggleSeriesSelection(s.id)}
                  activeOpacity={0.7}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                >
                  {isSelected ? (
                    <IconSymbol
                      name="checkmark.square.fill"
                      size={24}
                      color={theme.tint}
                    />
                  ) : (
                    <IconSymbol name="square" size={24} color={theme.icon} />
                  )}
                  <View style={styles.seriesLabelWrap}>
                    <ThemedText
                      style={styles.seriesName}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {s.name}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.seriesMeta,
                        { color: theme.textSecondary },
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {s.brandName} ·{" "}
                      {t("colors.colorCount", { count: s.colorCount })}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>

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
                { color: theme.textSecondary },
              ]}
            >
              {t("palettes.choosePhotoSubtitle")}
            </ThemedText>
            {loading ? (
              <View style={styles.pickLoadingWrap}>
                <ActivityIndicator size="large" color={theme.tint} />
              </View>
            ) : (
              <View style={styles.pickButtonsRow}>
                <Button
                  variant="secondary"
                  size="lg"
                  icon={
                    <IconSymbol
                      name="photo.on.rectangle.angled"
                      size={32}
                      color={theme.tint}
                      style={styles.pickOptionIcon}
                    />
                  }
                  style={[
                    styles.pickOption,
                    {
                      backgroundColor: theme.backgroundSecondary,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={pickImage}
                >
                  {t("palettes.selectFromGallery")}
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  icon={
                    <IconSymbol
                      name="camera.fill"
                      size={32}
                      color={theme.tint}
                      style={styles.pickOptionIcon}
                    />
                  }
                  style={[
                    styles.pickOption,
                    {
                      backgroundColor: theme.backgroundSecondary,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={takePhoto}
                >
                  {t("palettes.takePhoto")}
                </Button>
              </View>
            )}
          </View>
        )}

        {!hasImage && imageUriParam && loading && (
          <View style={styles.pickLoadingWrap}>
            <ActivityIndicator size="large" color={theme.tint} />
          </View>
        )}

        {error && (
          <ThemedText style={[styles.error, { color: theme.error }]}>
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
                        borderColor: theme.border,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>

            {showEquivalents && (
              <>
                <ThemedText
                  style={[styles.sectionLabel, { color: theme.textSecondary }]}
                >
                  {t("palettes.equivalents")}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.sectionSubtitle,
                    { color: theme.textSecondary },
                  ]}
                >
                  {t("palettes.selectMatchPerColor")}
                </ThemedText>
                {similaritiesPerHex.map(({ hex, bySeries }) => {
                  const selectedId = selectedCatalogColorByHex[hex];
                  return (
                    <View
                      key={hex}
                      style={[
                        styles.extractedColorBlock,
                        { borderColor: theme.border },
                      ]}
                    >
                      <View
                        style={[
                          styles.extractedColorHeader,
                          { borderBottomColor: theme.border },
                        ]}
                      >
                        <View
                          style={[
                            styles.originalSwatch,
                            { backgroundColor: hex },
                            (hex === "#ffffff" || hex.startsWith("#fff")) && {
                              borderWidth: 1,
                              borderColor: theme.border,
                            },
                          ]}
                        />
                        <ThemedText
                          style={[
                            styles.extractedHexLabel,
                            { color: theme.textSecondary },
                          ]}
                        >
                          {hex}
                        </ThemedText>
                      </View>
                      {bySeries.map(
                        ({ seriesId, seriesName, matches }, seriesIndex) => (
                          <View
                            key={seriesId}
                            style={[
                              styles.seriesMatchesSection,
                              seriesIndex > 0 && {
                                borderTopWidth: 1,
                                borderTopColor: theme.border,
                              },
                            ]}
                          >
                            <ThemedText
                              style={[
                                styles.seriesMatchesLabel,
                                { color: theme.textSecondary },
                              ]}
                              numberOfLines={1}
                            >
                              {seriesName}
                            </ThemedText>
                            {matches.map((match, matchIndex) => {
                              const name = getColorDisplayName(
                                match.catalogColor,
                                i18n.language,
                              );
                              const isSelected =
                                selectedId === match.catalogColor.id;
                              const isLastInSeries =
                                matchIndex === matches.length - 1;
                              return (
                                <TouchableOpacity
                                  key={match.catalogColor.id}
                                  style={[
                                    styles.similarRow,
                                    isLastInSeries
                                      ? { borderBottomWidth: 0 }
                                      : {
                                          borderBottomWidth: 1,
                                          borderBottomColor: theme.border,
                                        },
                                    isSelected && {
                                      backgroundColor:
                                        theme.backgroundSecondary,
                                    },
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
                                      {
                                        backgroundColor: match.catalogColor.hex,
                                      },
                                      (match.catalogColor.hex === "#ffffff" ||
                                        match.catalogColor.hex.startsWith(
                                          "#fff",
                                        )) && {
                                        borderWidth: 1,
                                        borderColor: theme.border,
                                      },
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
                                        { color: theme.textSecondary },
                                      ]}
                                    >
                                      {match.catalogColor.code}
                                    </ThemedText>
                                  </View>
                                  <ThemedText
                                    style={[
                                      styles.similarity,
                                      { color: theme.tint },
                                    ]}
                                  >
                                    {match.similarity}%
                                  </ThemedText>
                                  {isSelected ? (
                                    <IconSymbol
                                      name="checkmark.circle.fill"
                                      size={24}
                                      color={theme.tint}
                                    />
                                  ) : (
                                    <IconSymbol
                                      name="circle"
                                      size={24}
                                      color={theme.icon}
                                    />
                                  )}
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        ),
                      )}
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
    borderWidth: 2,
    borderStyle: "dashed",
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
    gap: 4,
  },
  miniSwatch: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.md,
  },
  seriesSheetContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },
  seriesList: {
    marginBottom: Spacing.lg,
  },
  seriesRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  seriesLabelWrap: {
    flex: 1,
    marginLeft: Spacing.sm,
    minWidth: 0,
  },
  seriesName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  seriesMeta: {
    fontSize: Typography.fontSize.sm,
    marginTop: 2,
  },
  extractedColorBlock: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  extractedColorHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.sm,
  },
  originalSwatch: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
  },
  extractedHexLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: "monospace",
  },
  seriesMatchesSection: {},
  seriesMatchesLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  similarRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.sm,
  },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    gap: Spacing.sm,
  },
  matchSwatch: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
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
