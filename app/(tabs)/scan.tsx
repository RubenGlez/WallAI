import { ColorDetailModal } from "@/components/color-detail-modal";
import { FilterDrawer } from "@/components/filter-drawer";
import {
  PaletteCreator,
  PaletteCreatorRef,
} from "@/components/palette-creator";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { FilterButton } from "@/components/filter-button";
import { FloatingActionButton } from "@/components/floating-action-button";
import { Button } from "@/components/button";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import i18n from "@/i18n";
import { useColorsStore } from "@/stores/useColorsStore";
import { usePaletteStore } from "@/stores/usePaletteStore";
import { ColorWithTranslations } from "@/types";
import BottomSheet from "@gorhom/bottom-sheet";
import { colord } from "colord";
import Constants from "expo-constants";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface SuggestedColor {
  color: ColorWithTranslations;
  distance: number;
  matchedFrom: string; // hex from the image palette
}

export default function ScanScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const { colorsWithTranslations, getColorsByBrandId, getColorsBySeriesId } =
    useColorsStore();

  const activePalette = usePaletteStore((state) => state.getActivePalette());
  const addColor = usePaletteStore((state) => state.addColor);
  const removeColor = usePaletteStore((state) => state.removeColor);
  const setActivePalette = usePaletteStore((state) => state.setActivePalette);

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedColors, setSuggestedColors] = useState<SuggestedColor[]>([]);

  const [selectedColor, setSelectedColor] =
    useState<ColorWithTranslations | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const paletteCreatorRef = useRef<PaletteCreatorRef>(null);

  const hasActiveFilters =
    selectedBrandId !== null || selectedSeriesId !== null;

  const candidateColors = useMemo(() => {
    let filtered = colorsWithTranslations;

    if (selectedSeriesId) {
      filtered = getColorsBySeriesId(selectedSeriesId);
    } else if (selectedBrandId) {
      filtered = getColorsByBrandId(selectedBrandId);
    }

    return filtered;
  }, [
    colorsWithTranslations,
    selectedBrandId,
    selectedSeriesId,
    getColorsByBrandId,
    getColorsBySeriesId,
  ]);

  const clearFilters = () => {
    setSelectedBrandId(null);
    setSelectedSeriesId(null);
  };

  const handleBrandPress = (brandId: string | null) => {
    setSelectedBrandId(brandId);
    setSelectedSeriesId(null);
  };

  const handleSeriesPress = (seriesId: string | null) => {
    setSelectedSeriesId(seriesId);
  };

  const openColorDetail = (color: ColorWithTranslations) => {
    setSelectedColor(color);
    bottomSheetRef.current?.expand();
  };

  const closeColorDetail = () => {
    bottomSheetRef.current?.close();
    setSelectedColor(null);
  };

  const togglePaletteColor = (color: ColorWithTranslations) => {
    if (!activePalette) return;
    const inPalette = activePalette.colors.some((c) => c.id === color.id);
    if (inPalette) {
      removeColor(color.id);
    } else {
      addColor(color);
    }
  };

  const handlePaletteCreated = (paletteId: string) => {
    // Ensure the new palette is active
    setActivePalette(paletteId);
    // Add all suggested colors to the newly created palette
    suggestedColors.forEach((suggested) => {
      addColor(suggested.color);
    });
  };

  const rgbDistance = (hex1: string, hex2: string) => {
    const a = colord(hex1).toRgb();
    const b = colord(hex2).toRgb();
    if (!a || !b) return Number.POSITIVE_INFINITY;
    const dr = a.r - b.r;
    const dg = a.g - b.g;
    const db = a.b - b.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  };

  const extractPaletteHexes = (result: any): string[] => {
    if (!result) return [];

    if (result.platform === "android" || result.platform === "web") {
      const {
        dominant,
        average,
        vibrant,
        darkVibrant,
        lightVibrant,
        darkMuted,
        lightMuted,
        muted,
      } = result;
      return [
        dominant,
        average,
        vibrant,
        darkVibrant,
        lightVibrant,
        darkMuted,
        lightMuted,
        muted,
      ].filter(Boolean);
    }

    if (result.platform === "ios") {
      const { background, primary, secondary, detail } = result;
      return [background, primary, secondary, detail].filter(Boolean);
    }

    return [];
  };

  const computeSuggestions = useCallback(
    (paletteHexes: string[]) => {
      const baseColors =
        candidateColors.length > 0 ? candidateColors : colorsWithTranslations;

      if (paletteHexes.length === 0 || baseColors.length === 0) {
        setSuggestedColors([]);
        return;
      }

      const bestById = new Map<string, SuggestedColor>();

      for (const sourceHex of paletteHexes) {
        for (const color of baseColors) {
          const distance = rgbDistance(sourceHex, color.hex);
          const existing = bestById.get(color.id);

          if (!existing || distance < existing.distance) {
            bestById.set(color.id, {
              color,
              distance,
              matchedFrom: sourceHex,
            });
          }
        }
      }

      const suggestions = Array.from(bestById.values())
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 24);

      setSuggestedColors(suggestions);
    },
    [candidateColors, colorsWithTranslations],
  );

  const analyzeImage = useCallback(
    async (uri: string) => {
      setIsProcessing(true);
      setError(null);
      setSuggestedColors([]);

      try {
        // Dynamically load the native module so Expo Go doesn't try to resolve it.
        const { getColors: getImageColors } =
          await import("react-native-image-colors");

        const result = await getImageColors(uri, {
          fallback: "#000000",
          cache: true,
          key: uri,
        });

        const paletteHexes = extractPaletteHexes(result);

        if (paletteHexes.length === 0) {
          setError(t("scan.noColorsFound"));
          setSuggestedColors([]);
          return;
        }

        computeSuggestions(paletteHexes);
      } catch (e) {
        console.error("Error analyzing image colors", e);
        setError(t("scan.errorProcessing"));
      } finally {
        setIsProcessing(false);
      }
    },
    [computeSuggestions, t],
  );

  const requestPermissionsIfNeeded = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    return (
      cameraStatus === ImagePicker.PermissionStatus.GRANTED &&
      mediaStatus === ImagePicker.PermissionStatus.GRANTED
    );
  };

  const handlePickImage = async (fromCamera: boolean) => {
    setError(null);

    // In Expo Go, the native ImageColors module is not available.
    // Avoid calling getImageColors and show a helpful message instead.
    if (Constants.appOwnership === "expo") {
      setError(
        t("scan.errorProcessing") +
          " (Color analysis requires a custom dev build; run `expo prebuild` and `expo run:ios`/`expo run:android`.)",
      );
      return;
    }

    const hasPerm = await requestPermissionsIfNeeded();
    if (!hasPerm) {
      setError(t("scan.permissionsDenied"));
      return;
    }

    if (fromCamera) {
      const cameraResult = await ImagePicker.launchCameraAsync({
        quality: 0.7,
      });
      if (!cameraResult.canceled) {
        const asset = cameraResult.assets[0];
        setImageUri(asset.uri);
        await analyzeImage(asset.uri);
      }
    } else {
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        quality: 0.7,
      });
      if (!pickerResult.canceled) {
        const asset = pickerResult.assets[0];
        setImageUri(asset.uri);
        await analyzeImage(asset.uri);
      }
    }

    // If user cancels, nothing happens
  };

  const handleRemoveImage = () => {
    setImageUri(null);
    setSuggestedColors([]);
    setError(null);
  };

  const renderSuggestedItem = ({ item }: { item: SuggestedColor }) => {
    const inPalette =
      activePalette?.colors.some((c) => c.id === item.color.id) ?? false;

    // Get color name in current language, fallback to English, then code, then unknown
    const displayName = (() => {
      const currentLang = i18n.language as "en" | "es" | "de" | "fr" | "pt";
      const translations = item.color.translations;

      if (translations?.[currentLang]) {
        return translations[currentLang];
      }
      if (translations?.en) {
        return translations.en;
      }
      if (item.color.code) {
        return item.color.code;
      }
      return t("common.unknown");
    })().toUpperCase();

    return (
      <TouchableOpacity
        style={styles.suggestedItem}
        activeOpacity={0.8}
        onPress={() => openColorDetail(item.color)}
      >
        <View
          style={[styles.suggestedSwatch, { backgroundColor: item.color.hex }]}
        />
        <View style={styles.suggestedInfo}>
          <ThemedText style={styles.suggestedCode}>{displayName}</ThemedText>
        </View>
        {activePalette && (
          <TouchableOpacity
            style={[
              styles.suggestedPaletteBadge,
              inPalette
                ? { backgroundColor: Colors.light.success }
                : {
                    backgroundColor: theme.background,
                    borderWidth: 1,
                    borderColor: theme.border,
                  },
            ]}
            onPress={() => togglePaletteColor(item.color)}
          >
            {inPalette ? (
              <ThemedText style={styles.suggestedPaletteBadgeText}>
                ✓
              </ThemedText>
            ) : (
              <IconSymbol name="plus" size={18} color={theme.text} />
            )}
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <FilterDrawer
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
            <View style={styles.headerTitleWrapper}>
              <ThemedText type="title" style={styles.title}>
                {t("scan.title")}
              </ThemedText>
            </View>
          </View>

          {/* Image Preview & Actions */}
          <View style={styles.imageSection}>
            {imageUri ? (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.imagePreview}
                  contentFit="cover"
                />
                <TouchableOpacity
                  style={[
                    styles.removeImageButton,
                    { backgroundColor: theme.error },
                  ]}
                  onPress={handleRemoveImage}
                  activeOpacity={0.8}
                >
                  <IconSymbol
                    name="xmark"
                    size={18}
                    color={theme.background}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <View
                style={[styles.imagePlaceholder, { borderColor: theme.border }]}
              >
                <IconSymbol
                  name="photo.on.rectangle.angled"
                  size={40}
                  color={theme.textSecondary}
                />
                <ThemedText style={styles.imagePlaceholderText}>
                  {t("scan.imagePlaceholder")}
                </ThemedText>
              </View>
            )}

            {isProcessing && (
              <View style={styles.processingRow}>
                <ActivityIndicator size="small" color={theme.tint} />
                <ThemedText style={styles.processingText}>
                  {t("scan.processing")}
                </ThemedText>
              </View>
            )}

            {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

            {imageUri && suggestedColors.length > 0 && (
              <Button
                onPress={() => paletteCreatorRef.current?.open()}
                label={t("scan.createPalette")}
                icon="swatchpalette"
                variant="primary"
                size="medium"
              />
            )}
          </View>

          {/* Suggested Colors */}
          {suggestedColors.length > 0 && (
            <View style={styles.suggestionsHeader}>
              <ThemedText style={styles.suggestionsTitle}>
                {t("scan.suggestionsCount", {
                  count: suggestedColors.length,
                })}
              </ThemedText>
              <FilterButton
                onPress={() => setFilterDrawerOpen(true)}
                hasActiveFilters={hasActiveFilters}
              />
            </View>
          )}
          <FlatList
            data={suggestedColors}
            keyExtractor={(item) => item.color.id}
            renderItem={renderSuggestedItem}
            contentContainerStyle={styles.suggestionsList}
            showsVerticalScrollIndicator={false}
          />

          {/* Floating Action Buttons */}
          <FloatingActionButton
            items={[
              {
                icon: "camera.fill",
                onPress: () => handlePickImage(true),
                size: "large",
              },
              {
                icon: "photo.fill.on.rectangle.fill",
                onPress: () => handlePickImage(false),
                size: "small",
              },
            ]}
          />
        </ThemedView>
      </FilterDrawer>

      <ColorDetailModal
        bottomSheetRef={bottomSheetRef}
        color={selectedColor}
        onClose={closeColorDetail}
      />

      <PaletteCreator
        ref={paletteCreatorRef}
        onCreated={handlePaletteCreated}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitleWrapper: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  imageSection: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  imagePreviewContainer: {
    position: "relative",
    marginBottom: Spacing.md,
  },
  imagePreview: {
    width: "100%",
    height: 220,
    borderRadius: BorderRadius.lg,
  },
  removeImageButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imagePlaceholder: {
    width: "100%",
    height: 220,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  imagePlaceholderText: {
    opacity: 0.7,
    textAlign: "center",
    paddingHorizontal: Spacing.md,
  },
  processingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  processingText: {
    fontSize: Typography.fontSize.sm,
    opacity: 0.7,
  },
  errorText: {
    marginTop: Spacing.sm,
    color: "#FF3B30",
    fontSize: Typography.fontSize.sm,
  },
  suggestionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  suggestionsTitle: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  suggestionsList: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  suggestedItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  suggestedSwatch: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
  },
  suggestedInfo: {
    flex: 1,
  },
  suggestedCode: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  suggestedMeta: {
    fontSize: Typography.fontSize.xs,
    opacity: 0.7,
  },
  suggestedPaletteBadge: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  suggestedPaletteBadgeText: {
    color: "#FFFFFF",
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
});
