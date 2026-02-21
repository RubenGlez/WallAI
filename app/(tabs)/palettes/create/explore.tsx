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
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ColorGridCard } from "@/components/color-grid-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getColorsBySeriesId } from "@/stores/useCatalogStore";
import { usePalettesStore } from "@/stores/usePalettesStore";
import type { Color } from "@/types";

const { width } = Dimensions.get("window");
const NUM_COLUMNS = 3;
const GAP = Spacing.sm;
const CARD_PADDING = Spacing.sm;
const CARD_WIDTH =
  (width - Spacing.md * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
const SWATCH_SIZE = CARD_WIDTH - CARD_PADDING * 2;

function getColorDisplayName(color: Color, language: string): string {
  const lang = language.split("-")[0];
  const names = color.name;
  if (!names || typeof names !== "object") return color.code;
  const forLang = names[lang as keyof typeof names];
  if (forLang) return forLang;
  const first = Object.values(names)[0];
  return typeof first === "string" ? first : color.code;
}

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

  const allColors = useMemo(() => {
    const seen = new Set<string>();
    const out: Color[] = [];
    for (const sid of seriesIdList) {
      const colors = getColorsBySeriesId(sid);
      for (const c of colors) {
        if (!seen.has(c.id)) {
          seen.add(c.id);
          out.push(c);
        }
      }
    }
    return out;
  }, [seriesIdList]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColors, setSelectedColors] = useState<Color[]>([]);
  const [showNameModal, setShowNameModal] = useState(false);
  const [paletteName, setPaletteName] = useState("");
  const [showOnlySelected, setShowOnlySelected] = useState(false);
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
              <TouchableOpacity
                onPress={handleDeletePalette}
                style={styles.headerRightButton}
                accessibilityRole="button"
                accessibilityLabel={t("projects.remove")}
              >
                <MaterialIcons
                  name="delete-outline"
                  size={24}
                  color={theme.tint}
                />
              </TouchableOpacity>
            ),
          }
        : {}),
    });
    return () => {
      navigation.getParent()?.setOptions({ tabBarStyle: undefined });
    };
  }, [navigation, t, paletteId, getPalette, handleDeletePalette, theme.tint]);

  const filteredColors = useMemo(() => {
    if (!searchQuery.trim()) return allColors;
    const q = searchQuery.trim().toLowerCase();
    return allColors.filter((c) => {
      const name = getColorDisplayName(c, i18n.language);
      return c.code.toLowerCase().includes(q) || name.toLowerCase().includes(q);
    });
  }, [allColors, searchQuery, i18n.language]);

  const listData = useMemo(() => {
    if (showOnlySelected && selectedColors.length > 0) {
      if (!searchQuery.trim()) return selectedColors;
      const q = searchQuery.trim().toLowerCase();
      return selectedColors.filter((c) => {
        const name = getColorDisplayName(c, i18n.language);
        return (
          c.code.toLowerCase().includes(q) || name.toLowerCase().includes(q)
        );
      });
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

  const renderItem = useCallback(
    ({ item }: { item: Color }) => (
      <ColorGridCard
        color={item}
        displayName={getColorDisplayName(item, i18n.language)}
        onPress={() => toggleColorInPalette(item)}
        isInPalette={selectedIds.has(item.id)}
        selectionMode
        cardWidth={CARD_WIDTH}
        swatchSize={SWATCH_SIZE}
      />
    ),
    [i18n.language, selectedIds, toggleColorInPalette],
  );

  return (
    <ThemedView style={styles.container}>
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
          <TouchableOpacity
            style={styles.searchClearBtn}
            onPress={() => setSearchQuery("")}
            accessibilityRole="button"
            accessibilityLabel={t("common.clear")}
          >
            <MaterialIcons
              name="cancel"
              size={22}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

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
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: theme.tint },
              selectedColors.length === 0 && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={selectedColors.length === 0}
          >
            <ThemedText
              style={[styles.saveButtonText, { color: theme.background }]}
            >
              {t("palettes.savePalette")}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showNameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNameModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowNameModal(false)}
          />
          <View
            style={[
              styles.modalCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <ThemedText style={styles.modalTitle}>
              {t("palettes.nameYourPalette")}
            </ThemedText>
            <TextInput
              style={[
                styles.nameInput,
                {
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder={t("palettes.paletteNamePlaceholder")}
              placeholderTextColor={theme.textSecondary}
              value={paletteName}
              onChangeText={setPaletteName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: theme.border }]}
                onPress={() => setShowNameModal(false)}
              >
                <ThemedText>{t("common.cancel")}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonPrimary,
                  { backgroundColor: theme.tint },
                ]}
                onPress={handleConfirmSave}
              >
                <ThemedText
                  style={[
                    styles.modalButtonPrimaryText,
                    { color: theme.background },
                  ]}
                >
                  {t("common.save")}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  headerRightButton: {
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: Spacing.md,
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
    paddingBottom: 160,
  },
  row: {
    gap: GAP,
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
  saveButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: Spacing.lg,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  nameInput: {
    height: 44,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: Typography.fontSize.md,
    marginBottom: Spacing.lg,
  },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    justifyContent: "flex-end",
  },
  modalButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  modalButtonPrimary: {},
  modalButtonPrimaryText: {
    fontWeight: Typography.fontWeight.semibold,
  },
});
