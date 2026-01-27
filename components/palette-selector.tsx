import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePaletteStore, Palette } from "@/stores/usePaletteStore";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, {
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

export interface PaletteSelectorRef {
  open: () => void;
  close: () => void;
}

export interface PaletteCreatorRef {
  open: () => void;
  close: () => void;
}

interface PaletteSelectorProps {
  onSelect?: (paletteId: string) => void;
  colorId?: string;
}

export const PaletteSelector = React.forwardRef<PaletteSelectorRef, PaletteSelectorProps>(
  ({ onSelect, colorId }, ref) => {
    const { t } = useTranslation();
    const colorScheme = useColorScheme() ?? "light";
    const theme = Colors[colorScheme];
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const { palettes, activePaletteId, setActivePalette } = usePaletteStore();
    const [searchQuery, setSearchQuery] = useState("");

    useImperativeHandle(ref, () => ({
      open: () => bottomSheetRef.current?.expand(),
      close: () => bottomSheetRef.current?.close(),
    }));

    const handleSheetChanges = useCallback((index: number) => {
      if (index === -1) {
        setSearchQuery("");
      }
    }, []);

    const handleSelectPalette = (paletteId: string) => {
      setActivePalette(paletteId);
      if (onSelect) {
        onSelect(paletteId);
      }
      bottomSheetRef.current?.close();
    };

    const isColorInPalette = (palette: Palette) => {
      if (!colorId) return false;
      return palette.colors.some((c) => c.id === colorId);
    };

    const renderPaletteItem = ({ item }: { item: Palette }) => {
      const isActive = item.id === activePaletteId;
      const hasColor = isColorInPalette(item);

      return (
        <TouchableOpacity
          style={[
            styles.paletteItem,
            { borderColor: theme.border },
            isActive && { borderColor: theme.tint, borderWidth: 2 },
          ]}
          onPress={() => handleSelectPalette(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.paletteItemContent}>
            <View style={styles.paletteInfo}>
              <ThemedText style={styles.paletteName}>{item.name}</ThemedText>
              <ThemedText style={styles.paletteCount}>
                {item.colors.length}{" "}
                {item.colors.length === 1
                  ? t("palettes.color")
                  : t("palettes.colors")}
              </ThemedText>
            </View>
            {hasColor && (
              <View style={[styles.checkBadge, { backgroundColor: theme.success }]}>
                <ThemedText style={styles.checkText}>✓</ThemedText>
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    };

    const filteredPalettes = useMemo(() => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return palettes;
      return palettes.filter((p) =>
        p.name.toLowerCase().includes(query)
      );
    }, [palettes, searchQuery]);

    return (
      <BottomSheet
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: theme.background }}
        handleIndicatorStyle={{ backgroundColor: theme.border }}
        snapPoints={useMemo(() => ["75%"], [])}
        index={-1}
      >
        <BottomSheetView style={styles.content}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <ThemedText type="title" style={styles.headerTitle}>
              {t("palettes.selectOrCreate")}
            </ThemedText>
            <TouchableOpacity
              onPress={() => bottomSheetRef.current?.close()}
              style={styles.closeButton}
            >
              <IconSymbol name="xmark.circle.fill" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <BottomSheetScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + Spacing.lg },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* Search box */}
            <View
              style={[
                styles.searchContainer,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.backgroundSecondary,
                },
              ]}
            >
              <IconSymbol
                name="magnifyingglass"
                size={18}
                color={theme.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder={t("palettes.searchPlaceholder")}
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
                    size={18}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Palettes List */}
            {filteredPalettes.length > 0 ? (
              filteredPalettes.map((item) => (
                <View key={item.id}>
                  {renderPaletteItem({ item })}
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>
                  {t("palettes.noPalettes")}
                </ThemedText>
              </View>
            )}
          </BottomSheetScrollView>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

PaletteSelector.displayName = "PaletteSelector";

interface PaletteCreatorProps {
  onCreated?: (paletteId: string) => void;
}

export const PaletteCreator = React.forwardRef<PaletteCreatorRef, PaletteCreatorProps>(
  ({ onCreated }, ref) => {
    const { t } = useTranslation();
    const colorScheme = useColorScheme() ?? "light";
    const theme = Colors[colorScheme];
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const { createPalette, setActivePalette } = usePaletteStore();
    const [newPaletteName, setNewPaletteName] = useState("");

    useImperativeHandle(ref, () => ({
      open: () => bottomSheetRef.current?.expand(),
      close: () => bottomSheetRef.current?.close(),
    }));

    const handleSheetChanges = useCallback((index: number) => {
      if (index === -1) {
        setNewPaletteName("");
      }
    }, []);

    const handleCreatePalette = () => {
      if (!newPaletteName.trim()) return;
      const name = newPaletteName.trim();
      const newId = createPalette(name);
      setActivePalette(newId);
      if (onCreated) {
        onCreated(newId);
      }
      setNewPaletteName("");
      bottomSheetRef.current?.close();
    };

    return (
      <BottomSheet
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: theme.background }}
        handleIndicatorStyle={{ backgroundColor: theme.border }}
        snapPoints={useMemo(() => ["40%"], [])}
        index={-1}
      >
        <BottomSheetView style={styles.content}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <ThemedText type="title" style={styles.headerTitle}>
              {t("palettes.createNew")}
            </ThemedText>
            <TouchableOpacity
              onPress={() => bottomSheetRef.current?.close()}
              style={styles.closeButton}
            >
              <IconSymbol name="xmark.circle.fill" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <BottomSheetScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + Spacing.lg },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.createForm, { borderColor: theme.border }]}>
              <TextInput
                style={[
                  styles.nameInput,
                  { color: theme.text, borderColor: theme.border },
                ]}
                placeholder={t("palettes.paletteName")}
                placeholderTextColor={theme.textSecondary}
                value={newPaletteName}
                onChangeText={setNewPaletteName}
                autoFocus
              />
              <View style={styles.createFormActions}>
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: theme.border }]}
                  onPress={() => {
                    setNewPaletteName("");
                    bottomSheetRef.current?.close();
                  }}
                >
                  <ThemedText style={styles.cancelButtonText}>
                    {t("common.cancel")}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.createConfirmButton,
                    {
                      backgroundColor: newPaletteName.trim()
                        ? theme.tint
                        : theme.border,
                    },
                  ]}
                  onPress={handleCreatePalette}
                  disabled={!newPaletteName.trim()}
                >
                  <ThemedText
                    style={[
                      styles.createConfirmButtonText,
                      {
                        color: newPaletteName.trim()
                          ? "#FFFFFF"
                          : theme.textSecondary,
                      },
                    ]}
                  >
                    {t("common.create")}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </BottomSheetScrollView>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

PaletteCreator.displayName = "PaletteCreator";

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    margin: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  createButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  createForm: {
    margin: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
  nameInput: {
    fontSize: Typography.fontSize.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  createFormActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  cancelButton: {
    flex: 1,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: Typography.fontSize.md,
  },
  createConfirmButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  createConfirmButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
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
  paletteItem: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  paletteItemContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paletteInfo: {
    flex: 1,
  },
  paletteName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  paletteCount: {
    fontSize: Typography.fontSize.sm,
    opacity: 0.7,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  checkText: {
    color: "#FFFFFF",
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  emptyContainer: {
    padding: Spacing.xxl,
    alignItems: "center",
  },
  emptyText: {
    opacity: 0.7,
  },
});
