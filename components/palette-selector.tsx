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
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

export interface PaletteSelectorRef {
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
    const {
      palettes,
      activePaletteId,
      createPalette,
      setActivePalette,
      getPalette,
    } = usePaletteStore();
    const [isCreating, setIsCreating] = useState(false);
    const [newPaletteName, setNewPaletteName] = useState("");

    useImperativeHandle(ref, () => ({
      open: () => bottomSheetRef.current?.expand(),
      close: () => bottomSheetRef.current?.close(),
    }));

    const handleSheetChanges = useCallback((index: number) => {
      if (index === -1) {
        setIsCreating(false);
        setNewPaletteName("");
      }
    }, []);

    const handleSelectPalette = (paletteId: string) => {
      setActivePalette(paletteId);
      if (onSelect) {
        onSelect(paletteId);
      }
      bottomSheetRef.current?.close();
    };

    const handleCreatePalette = () => {
      if (newPaletteName.trim()) {
        const newId = createPalette(newPaletteName.trim());
        setActivePalette(newId);
        if (onSelect) {
          onSelect(newId);
        }
        setNewPaletteName("");
        setIsCreating(false);
        bottomSheetRef.current?.close();
      }
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
            {/* Create New Palette Section */}
            {!isCreating ? (
              <TouchableOpacity
                style={[
                  styles.createButton,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
                onPress={() => setIsCreating(true)}
              >
                <IconSymbol
                  name="plus.circle.fill"
                  size={24}
                  color={theme.tint}
                />
                <ThemedText style={[styles.createButtonText, { color: theme.tint }]}>
                  {t("palettes.createNew")}
                </ThemedText>
              </TouchableOpacity>
            ) : (
              <View style={[styles.createForm, { borderColor: theme.border }]}>
                <TextInput
                  style={[styles.nameInput, { color: theme.text, borderColor: theme.border }]}
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
                      setIsCreating(false);
                      setNewPaletteName("");
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
                        { color: newPaletteName.trim() ? "#FFFFFF" : theme.textSecondary },
                      ]}
                    >
                      {t("common.create")}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Palettes List */}
            {palettes.length > 0 ? (
              palettes.map((item) => (
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
