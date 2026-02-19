import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePalettesStore } from "@/stores/usePalettesStore";
import type { Color, Palette } from "@/types";

const { width } = Dimensions.get("window");
const FAB_SIZE = 56;
const FAB_SIZE_SECONDARY = 48;
const NUM_COLUMNS = 2;
const GAP = Spacing.sm;
const CARD_PADDING = Spacing.md;
const CARD_WIDTH =
  (width - Spacing.md * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
const SWATCH_SIZE = (CARD_WIDTH - CARD_PADDING * 2) / 4 - 2;
const SWATCHES_TO_SHOW = 7;

function PaletteCard({
  palette,
  onPress,
}: {
  palette: Palette;
  onPress: () => void;
}) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const swatches = palette.colors.slice(0, SWATCHES_TO_SHOW) as Color[];
  const extraCount =
    palette.colors.length > SWATCHES_TO_SHOW
      ? palette.colors.length - SWATCHES_TO_SHOW
      : 0;
  const isLight = (hex: string) =>
    hex.toLowerCase() === "#ffffff" || hex.toLowerCase().startsWith("#fff");

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.swatchRow}>
        {swatches.length > 0 ? (
          <>
            {swatches.map((c) => (
              <View
                key={c.id}
                style={[
                  styles.swatch,
                  { backgroundColor: c.hex },
                  isLight(c.hex) && {
                    borderWidth: 1,
                    borderColor: theme.border,
                  },
                ]}
              />
            ))}
            {extraCount > 0 && (
              <View style={styles.swatchMore}>
                <ThemedText
                  style={[
                    styles.swatchMoreText,
                    { color: theme.textSecondary },
                  ]}
                >
                  +{extraCount}
                </ThemedText>
              </View>
            )}
          </>
        ) : (
          <View
            style={[
              styles.swatchPlaceholder,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <MaterialIcons
              name="palette"
              size={20}
              color={theme.textSecondary}
            />
          </View>
        )}
      </View>
      <ThemedText style={styles.cardTitle} numberOfLines={1}>
        {palette.name || "Sin nombre"}
      </ThemedText>
    </TouchableOpacity>
  );
}

export default function PalettesIndexScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const palettes = usePalettesStore((s) => s.palettes);

  const handleCreateNew = () => {
    router.push("/(tabs)/palettes/create");
  };
  const handleImportFromImage = () => {
    router.push("/(tabs)/palettes/import");
  };

  const fabBottom = Spacing.md;

  return (
    <ThemedView style={styles.container} safeArea="top">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="title" style={styles.title}>
          {t("palettes.myPalettes")}
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          {t("palettes.subtitle")}
        </ThemedText>

        {palettes.length === 0 ? (
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.emptyCard,
              {
                backgroundColor: theme.backgroundSecondary,
                borderColor: theme.border,
              },
            ]}
            onPress={handleCreateNew}
          >
            <View
              style={[styles.emptyIconWrap, { backgroundColor: theme.card }]}
            >
              <MaterialIcons name="palette" size={28} color={theme.tint} />
            </View>
            <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
              {t("palettes.emptyTitle")}
            </ThemedText>
            <ThemedText
              style={[styles.emptySubtitle, { color: theme.textSecondary }]}
            >
              {t("palettes.emptyHint")}
            </ThemedText>
          </TouchableOpacity>
        ) : (
          <View style={styles.grid}>
            {palettes.map((palette) => (
              <PaletteCard
                key={palette.id}
                palette={palette}
                onPress={() => {
                  const seriesIds = [
                    ...new Set(palette.colors.map((c) => c.seriesId)),
                  ].join(",");
                  const initialColorIds = palette.colors
                    .map((c) => c.id)
                    .join(",");
                  router.push({
                    pathname: "/(tabs)/palettes/create/explore",
                    params: {
                      seriesIds,
                      initialColorIds,
                      paletteId: palette.id,
                    },
                  });
                }}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <View
        style={[styles.fabContainer, { bottom: fabBottom }]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          style={[
            styles.fab,
            styles.fabSecondary,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
          onPress={handleImportFromImage}
          accessibilityRole="button"
          accessibilityLabel={t("palettes.importFromImage")}
        >
          <MaterialIcons name="image" size={24} color={theme.tint} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.fab,
            styles.fabPrimary,
            { backgroundColor: theme.tint },
          ]}
          onPress={handleCreateNew}
          accessibilityRole="button"
          accessibilityLabel={t("palettes.createNew")}
        >
          <MaterialIcons name="add" size={28} color={theme.background} />
        </TouchableOpacity>
      </View>
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
    paddingBottom: Spacing.xxl + 120,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    marginBottom: Spacing.lg,
    opacity: 0.9,
  },
  fabContainer: {
    position: "absolute",
    right: Spacing.md,
    flexDirection: "column",
    alignItems: "center",
    gap: Spacing.sm,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.lg,
  },
  fabPrimary: {
    width: FAB_SIZE,
    height: FAB_SIZE,
  },
  fabSecondary: {
    width: FAB_SIZE_SECONDARY,
    height: FAB_SIZE_SECONDARY,
    borderRadius: FAB_SIZE_SECONDARY / 2,
    borderWidth: 1,
  },
  emptyCard: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderStyle: "dashed",
    minHeight: 140,
    ...Shadows.sm,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.sm,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: CARD_WIDTH,
    padding: CARD_PADDING,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: GAP,
    ...Shadows.sm,
  },
  swatchRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
    marginBottom: Spacing.sm,
    minHeight: SWATCH_SIZE * 2 + 2,
  },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: BorderRadius.sm,
  },
  swatchPlaceholder: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  swatchMore: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  swatchMoreText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  cardTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
});
