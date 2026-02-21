import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
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
  Alert,
  FlatList,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/button";
import { ColorGridCard } from "@/components/color-grid-card";
import { ColorSearchInput } from "@/components/color-search-input";
import { SaveNameModal } from "@/components/save-name-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { COLOR_GRID } from "@/constants/color-grid";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  filterColorsBySearch,
  getColorDisplayName,
  getColorsForSeriesIds,
} from "@/lib/color";
import { getColorsBySeriesId } from "@/stores/useCatalogStore";
import { usePalettesStore } from "@/stores/usePalettesStore";
import type { Color } from "@/types";

const { NUM_COLUMNS, GAP, HORIZONTAL_PADDING, CARD_WIDTH, SWATCH_SIZE } =
  COLOR_GRID;

export default function CreatePaletteExploreScreen() {
  const { seriesIds, initialColorIds, paletteId } = useLocalSearchParams<{
    seriesIds: string;
    initialColorIds?: string;
    paletteId?: string;
  }>();
  const navigation = useNavigation();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const addPalette = usePalettesStore((s) => s.addPalette);
  const updatePalette = usePalettesStore((s) => s.updatePalette);
  const getPalette = usePalettesStore((s) => s.getPalette);
  const removePalette = usePalettesStore((s) => s.removePalette);

  const seriesIdList = useMemo(
    () => (seriesIds ? seriesIds.split(",").filter(Boolean) : []),
    [seriesIds],
  );

  const allColors = useMemo(
    () => getColorsForSeriesIds(seriesIdList, getColorsBySeriesId),
    [seriesIdList]
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColors, setSelectedColors] = useState<Color[]>([]);
  const [showNameModal, setShowNameModal] = useState(false);
  const [paletteName, setPaletteName] = useState("");
  const [showOnlySelected, setShowOnlySelected] = useState(!!paletteId);
  const initialAppliedRef = useRef(false);

  useEffect(() => {
    if (initialAppliedRef.current || !initialColorIds || allColors.length === 0)
      return;
    initialAppliedRef.current = true;
    const ids = new Set(initialColorIds.split(",").filter(Boolean));
    setSelectedColors(allColors.filter((c) => ids.has(c.id)));
  }, [initialColorIds, allColors]);

  const handleDeletePalette = useCallback(() => {
    if (!paletteId) return;
    Alert.alert(
      t("projects.removePaletteTitle"),
      t("projects.removePaletteMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("projects.remove"),
          style: "destructive",
          onPress: () => {
            removePalette(paletteId);
            router.replace("/(tabs)/palettes");
          },
        },
      ],
    );
  }, [paletteId, removePalette, router, t]);

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: "none" } });
    const palette = paletteId ? getPalette(paletteId) : undefined;
    const title = palette?.name?.trim() || t("palettes.exploreColorsTitle");
    navigation.setOptions({
      title,
      ...(paletteId
        ? {
            headerRight: () => (
              <Button
                variant="ghost"
                size="icon"
                onPress={handleDeletePalette}
                accessibilityLabel={t("projects.remove")}
                icon={<MaterialIcons name="delete-outline" size={24} color={theme.tint} />}
              />
            ),
          }
        : {}),
    });
    return () => {
      navigation.getParent()?.setOptions({ tabBarStyle: undefined });
    };
  }, [navigation, t, paletteId, getPalette, handleDeletePalette, theme.tint]);

  const filteredColors = useMemo(
    () => filterColorsBySearch(allColors, searchQuery, i18n.language),
    [allColors, searchQuery, i18n.language]
  );

  const listData = useMemo(() => {
    if (showOnlySelected && selectedColors.length > 0) {
      return filterColorsBySearch(
        selectedColors,
        searchQuery,
        i18n.language
      );
    }
    return filteredColors;
  }, [showOnlySelected, selectedColors, filteredColors, searchQuery, i18n.language]);

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
          onPress={() => toggleColorInPalette(item)}
          isInPalette={selectedIds.has(item.id)}
          selectionMode
          cardWidth={CARD_WIDTH}
          swatchSize={SWATCH_SIZE}
        />
      </View>
    ),
    [i18n.language, selectedIds, toggleColorInPalette],
  );

  return (
    <ThemedView style={styles.container}>
      <ColorSearchInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={t("colors.searchPlaceholder")}
        clearAccessibilityLabel={t("common.clear")}
      />

      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={NUM_COLUMNS}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.background,
            borderTopColor: theme.border,
            paddingBottom: Spacing.md + insets.bottom,
          },
        ]}
      >
        <View style={styles.footerActionsRow}>
          <View style={styles.switchWrap}>
            <Switch
              value={showOnlySelected}
              onValueChange={setShowOnlySelected}
              trackColor={{ false: theme.border, true: theme.tint }}
              thumbColor={theme.background}
            />
            <ThemedText
              style={[styles.switchLabel, { color: theme.textSecondary }]}
            >
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
  listContent: {
    paddingTop: GAP,
    paddingBottom: 160,
  },
  row: {
    flexDirection: "row",
    marginBottom: GAP,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: Spacing.md,
    borderTopWidth: 1,
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
