import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getColors } from "react-native-image-colors";

import { Surface } from "@/constants/theme";
import { extractHexPalette, findClosestColors } from "@/lib/colorMatch";
import { getAllSeriesWithCount, getColorsBySeriesId } from "@/stores/useCatalogStore";
import type { Color, SeriesWithCountAndBrand } from "@/types";

export type SimilarityByHex = {
  hex: string;
  bySeries: {
    seriesId: string;
    seriesName: string;
    matches: ReturnType<typeof findClosestColors>;
  }[];
};

export type UseImportPaletteFromImageReturn = {
  imageUri: string | null;
  extractedHexes: string[];
  loading: boolean;
  error: string | null;
  allSeries: SeriesWithCountAndBrand[];
  selectedSeriesIds: Set<string>;
  selectedCatalogColorByHex: Record<string, string>;
  similaritiesPerHex: SimilarityByHex[];
  selectedColorsForPalette: Color[];
  processImageUri: (uri: string) => Promise<void>;
  pickImage: () => Promise<void>;
  takePhoto: () => Promise<void>;
  toggleSeriesSelection: (seriesId: string) => void;
  handleSelectAllSeries: () => void;
  handleClearSeries: () => void;
  selectCatalogColorForHex: (hex: string, catalogColorId: string | null) => void;
};

/**
 * Encapsulates the full image → color extraction → catalog matching pipeline
 * for the palette import screen. The screen retains only the save/name flow.
 */
export function useImportPaletteFromImage(
  imageUriParam: string | undefined,
): UseImportPaletteFromImageReturn {
  const { t } = useTranslation();

  const allSeries = useMemo(() => getAllSeriesWithCount(), []);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [extractedHexes, setExtractedHexes] = useState<string[]>([]);
  const [selectedSeriesIds, setSelectedSeriesIds] = useState<Set<string>>(new Set());
  const [selectedCatalogColorByHex, setSelectedCatalogColorByHex] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasInitializedSeriesSelection = useRef(false);
  const hasProcessedParamImage = useRef(false);

  // Default: select first series once catalog is available
  useEffect(() => {
    if (allSeries.length > 0 && !hasInitializedSeriesSelection.current) {
      hasInitializedSeriesSelection.current = true;
      setSelectedSeriesIds(new Set([allSeries[0].id]));
    }
  }, [allSeries]);

  const processImageUri = useCallback(async (uri: string) => {
    setImageUri(uri);
    const colorsResult = await getColors(uri, { fallback: Surface.lowest });
    const hexes = extractHexPalette(colorsResult as unknown as Record<string, string>);
    setExtractedHexes(hexes);
    const series = getAllSeriesWithCount();
    setSelectedSeriesIds(new Set(series.length > 0 ? [series[0].id] : []));
    setSelectedCatalogColorByHex({});
  }, []);

  // Process imageUri passed as navigation param (from gallery/camera FAB)
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
      if (result.canceled || !result.assets[0]) return;
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
      const result = await ImagePicker.launchCameraAsync({ allowsEditing: false, quality: 0.8 });
      if (result.canceled || !result.assets[0]) return;
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

  const selectCatalogColorForHex = useCallback((hex: string, catalogColorId: string | null) => {
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
  }, []);

  const catalogColorsForMatch = useMemo(() => {
    const seen = new Set<string>();
    const out: Color[] = [];
    for (const seriesId of selectedSeriesIds) {
      for (const c of getColorsBySeriesId(seriesId)) {
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

  const similaritiesPerHex = useMemo<SimilarityByHex[]>(() => {
    if (extractedHexes.length === 0 || selectedSeriesWithNames.length === 0) return [];
    return extractedHexes.map((hex) => ({
      hex,
      bySeries: selectedSeriesWithNames.map((series) => ({
        seriesId: series.id,
        seriesName: series.name,
        matches: findClosestColors(hex, getColorsBySeriesId(series.id), 3),
      })),
    }));
  }, [extractedHexes, selectedSeriesWithNames]);

  const selectedColorsForPalette = useMemo(
    () =>
      extractedHexes
        .map((hex) => catalogColorsForMatch.find((c) => c.id === selectedCatalogColorByHex[hex]))
        .filter((c): c is Color => c != null),
    [extractedHexes, catalogColorsForMatch, selectedCatalogColorByHex],
  );

  return {
    imageUri,
    extractedHexes,
    loading,
    error,
    allSeries,
    selectedSeriesIds,
    selectedCatalogColorByHex,
    similaritiesPerHex,
    selectedColorsForPalette,
    processImageUri,
    pickImage,
    takePhoto,
    toggleSeriesSelection,
    handleSelectAllSeries,
    handleClearSeries,
    selectCatalogColorForHex,
  };
}
