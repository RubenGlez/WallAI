import { ThemedText } from "@/components/themed-text";
import { SearchBar } from "@/components/search-bar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Palette, usePaletteStore } from "@/stores/usePaletteStore";
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
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface PaletteSelectorRef {
  open: () => void;
  close: () => void;
}

interface PaletteSelectorProps {
  onSelect?: (paletteId: string) => void;
  colorId?: string;
}

interface PaletteListProps {
  palettes: Palette[];
  renderPaletteItem: ({ item }: { item: Palette }) => React.ReactNode;
  emptyText: string;
}

const PaletteList: React.FC<PaletteListProps> = ({
  palettes,
  renderPaletteItem,
  emptyText,
}) => {
  if (palettes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>{emptyText}</ThemedText>
      </View>
    );
  }

  return (
    <>
      {palettes.map((item) => (
        <View key={item.id}>{renderPaletteItem({ item })}</View>
      ))}
    </>
  );
};

export const PaletteSelector = React.forwardRef<
  PaletteSelectorRef,
  PaletteSelectorProps
>(({ onSelect, colorId }, ref) => {
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
            <View
              style={[styles.checkBadge, { backgroundColor: theme.success }]}
            >
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
    return palettes.filter((p) => p.name.toLowerCase().includes(query));
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
        <View style={styles.header}>
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
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t("palettes.searchPlaceholder")}
            containerStyle={styles.searchBar}
          />

          <PaletteList
            palettes={filteredPalettes}
            renderPaletteItem={renderPaletteItem}
            emptyText={t("palettes.noPalettes")}
          />
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
});

PaletteSelector.displayName = "PaletteSelector";

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: Spacing.lg,
    paddingTop: 0,
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
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  searchBar: {
    marginBottom: Spacing.lg,
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
