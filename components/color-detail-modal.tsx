import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePaletteStore } from "@/stores/usePaletteStore";
import { useColorsStore } from "@/stores/useColorsStore";
import { ColorWithTranslations } from "@/types";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

interface ColorDetailModalProps {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  color: ColorWithTranslations | null;
  onClose: () => void;
}

export function ColorDetailModal({
  bottomSheetRef,
  color,
  onClose,
}: ColorDetailModalProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? "light";
  // Subscribe to palette changes to trigger re-renders
  const activePalette = usePaletteStore((state) => state.getActivePalette());
  const addColor = usePaletteStore((state) => state.addColor);
  const removeColor = usePaletteStore((state) => state.removeColor);
  const { getSeriesById, getBrandById } = useColorsStore();

  const series = useMemo(() => {
    return color ? getSeriesById(color.seriesId) : undefined;
  }, [color, getSeriesById]);

  const brand = useMemo(() => {
    return series ? getBrandById(series.brandId) : undefined;
  }, [series, getBrandById]);

  const hasActivePalette = activePalette !== null;

  const inPalette = useMemo(() => {
    if (!color || !activePalette) return false;
    return activePalette.colors.some((c) => c.id === color.id);
  }, [color, activePalette]);

  const handleTogglePalette = useCallback(() => {
    if (!color || !hasActivePalette) return;
    if (inPalette) {
      removeColor(color.id);
    } else {
      addColor(color);
    }
  }, [color, inPalette, hasActivePalette, addColor, removeColor]);

  const theme = Colors[colorScheme];
  
  // Get color name in current language, fallback to English, then code, then unknown
  const getColorName = useCallback(() => {
    if (!color) return t('common.unknown');
    
    const currentLang = i18n.language as "en" | "es" | "de" | "fr" | "pt";
    const translations = color.translations;
    
    // Try current language first
    if (translations?.[currentLang]) {
      return translations[currentLang];
    }
    
    // Fallback to English
    if (translations?.en) {
      return translations.en;
    }
    
    // Fallback to code
    if (color.code) {
      return color.code;
    }
    
    // Last resort
    return t('common.unknown');
  }, [color, t]);
  
  const name = useMemo(() => getColorName(), [getColorName]);
  const insets = useSafeAreaInsets();

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose],
  );

  return (
    <>
      <BottomSheet
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: theme.background }}
        handleIndicatorStyle={{ backgroundColor: theme.border }}
      >
        {color && (
          <BottomSheetView style={styles.content}>
            {/* Header with Name and Close Button */}
            <View style={styles.header}>
              <ThemedText type="title" style={styles.colorName}>
                {name}
              </ThemedText>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => bottomSheetRef.current?.close()}
              >
                <IconSymbol
                  name="xmark.circle.fill"
                  size={24}
                  color={theme.text}
                />
              </TouchableOpacity>
            </View>

            <BottomSheetScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Color Swatch */}
              <View
                style={[
                  styles.colorSwatch,
                  { backgroundColor: color.hex },
                  styles.colorSwatchLarge,
                ]}
              >
                <View
                  style={[
                    styles.colorSwatchBorder,
                    { borderColor: theme.border },
                  ]}
                />
              </View>

              {/* Color Info */}
              <View style={styles.infoSection}>
                <ThemedText style={styles.colorCode}>
                  {t('colors.code')}: {color.code}
                </ThemedText>

                {series && (
                  <View style={styles.metaSection}>
                    <ThemedText style={styles.metaLabel}>{t('colors.series')}:</ThemedText>
                    <ThemedText style={styles.metaValue}>
                      {series.name}
                    </ThemedText>
                  </View>
                )}

                {brand && (
                  <View style={styles.metaSection}>
                    <ThemedText style={styles.metaLabel}>{t('colors.brand')}:</ThemedText>
                    <ThemedText style={styles.metaValue}>{brand.name}</ThemedText>
                  </View>
                )}
              </View>

              {/* Action Button - Inside ScrollView */}
              <View
                style={[
                  styles.buttonContainer,
                  { paddingBottom: insets.bottom + Spacing.xxl + 50 }, // 50 for tab bar height
                ]}
              >
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: inPalette
                      ? theme.error
                      : hasActivePalette
                      ? theme.success
                      : theme.border,
                    opacity: hasActivePalette ? 1 : 0.5,
                  },
                ]}
                onPress={handleTogglePalette}
                disabled={!hasActivePalette}
              >
                <ThemedText
                  style={[styles.actionButtonText, { color: "#FFFFFF" }]}
                >
                  {inPalette
                    ? t('colors.removeFromPalette')
                    : t('colors.addToPalette')}
                </ThemedText>
              </TouchableOpacity>
              </View>
            </BottomSheetScrollView>
          </BottomSheetView>
        )}
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  colorSwatch: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    position: "relative",
    overflow: "hidden",
  },
  colorSwatchLarge: {
    marginVertical: Spacing.md,
  },
  colorSwatchBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
  },
  infoSection: {
    marginBottom: Spacing.lg,
  },
  colorName: {
    fontSize: Typography.fontSize.xl,
    flex: 1,
    marginRight: Spacing.md,
  },
  colorCode: {
    fontSize: Typography.fontSize.md,
    marginBottom: Spacing.md,
    opacity: 0.7,
  },
  metaSection: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
  },
  metaLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    marginRight: Spacing.sm,
  },
  metaValue: {
    fontSize: Typography.fontSize.md,
  },
  buttonContainer: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  actionButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  closeButton: {
    padding: Spacing.xs,
  },
});
