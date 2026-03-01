import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";

import { Button } from "@/components/button";
import { DoodleCard } from "@/components/doodle-card";
import { PaletteCard } from "@/components/palette-card";
import { Screen } from "@/components/screen";
import { ScreenHeader } from "@/components/screen-header";
import { SeriesCard } from "@/components/series-card";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { getAllSeriesWithCount } from "@/stores/useCatalogStore";
import { useDoodlesStore } from "@/stores/useDoodlesStore";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { usePalettesStore } from "@/stores/usePalettesStore";
import { useProfileStore } from "@/stores/useProfileStore";
import type { SeriesWithCountAndBrand } from "@/types";

const RECENT_PALETTES_COUNT = 4;
const FAVORITE_SERIES_COUNT = 6;

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme } = useTheme();
  const aka = useProfileStore((s) => s.aka);

  const doodles = useDoodlesStore((s) => s.doodles);
  const palettes = usePalettesStore((s) => s.palettes);

  const favoriteSeriesIds = useFavoritesStore((s) => s.favoriteSeriesIds);
  const toggleFavoriteSeries = useFavoritesStore((s) => s.toggleFavoriteSeries);

  const allSeries = useMemo(() => getAllSeriesWithCount(), []);
  const favoriteSeries = useMemo(
    () => allSeries.filter((s) => favoriteSeriesIds.includes(s.id)),
    [allSeries, favoriteSeriesIds],
  );
  const favoriteSeriesPreview = useMemo(
    () => favoriteSeries.slice(0, FAVORITE_SERIES_COUNT),
    [favoriteSeries],
  );

  const lastDoodle = useMemo(() => {
    if (doodles.length === 0) return null;
    return [...doodles].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )[0];
  }, [doodles]);

  const recentPalettes = useMemo(
    () => palettes.slice(0, RECENT_PALETTES_COUNT),
    [palettes],
  );

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title={
            (aka.trim()
              ? t("home.titleWithName", { name: aka.trim() })
              : t("home.title")) + " 👋"
          }
          subtitle={t("home.subtitle")}
        />

        {/* Action buttons: Crear paleta + Nuevo doodle en una línea, Explorar colores en otra */}
        <View style={styles.actionsRow}>
          <Button
            variant="primary"
            size="lg"
            style={styles.actionButtonHalf}
            icon={
              <IconSymbol
                name="paintpalette"
                size={22}
                color={theme.background}
              />
            }
            onPress={() => router.push("/palettes/create")}
          >
            {t("home.createPalette")}
          </Button>
          <Button
            variant="primary"
            size="lg"
            style={styles.actionButtonHalf}
            icon={
              <IconSymbol
                name="square.stack.3d.up"
                size={22}
                color={theme.background}
              />
            }
            onPress={() => router.push("/doodles/create")}
          >
            {t("home.newDoodle")}
          </Button>
        </View>
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          icon={
            <IconSymbol name="square.grid.2x2" size={22} color={theme.text} />
          }
          onPress={() => router.push("/(tabs)/catalog")}
        >
          {t("home.exploreColors")}
        </Button>

        {/* Continuar último doodle */}
        {lastDoodle && (
          <View style={styles.section}>
            <ThemedText
              style={[styles.sectionTitle, { color: theme.textSecondary }]}
            >
              {t("home.continueLastDoodle")}
            </ThemedText>
            <View style={styles.doodlesGrid}>
              <DoodleCard
                doodle={lastDoodle}
                onPress={() =>
                  router.push({
                    pathname: "/doodles/create",
                    params: { doodleId: lastDoodle.id },
                  })
                }
              />
            </View>
          </View>
        )}

        {/* Recent palettes */}
        {recentPalettes.length > 0 && (
          <View style={styles.section}>
            <ThemedText
              style={[styles.sectionTitle, { color: theme.textSecondary }]}
            >
              {t("home.recentPalettes")}
            </ThemedText>
            <View style={styles.palettesGrid}>
              {recentPalettes.map((palette) => (
                <PaletteCard
                  key={palette.id}
                  palette={palette}
                  onPress={() =>
                    router.push({
                      pathname: "/palettes/create",
                      params: { paletteId: palette.id },
                    })
                  }
                />
              ))}
            </View>
          </View>
        )}

        {/* Favorite series (preview) — only show when there are favorites */}
        {favoriteSeriesPreview.length > 0 && (
          <View style={styles.section}>
            <ThemedText
              style={[styles.sectionTitle, { color: theme.textSecondary }]}
            >
              {t("colors.favoriteSeries")}
            </ThemedText>
            <View style={styles.sectionGrid}>
              {favoriteSeriesPreview.map((series: SeriesWithCountAndBrand) => (
                <SeriesCard
                  key={series.id}
                  series={series}
                  isFavorite
                  onPress={() => router.push(`/color-grid/${series.id}`)}
                  onFavorite={() => toggleFavoriteSeries(series.id)}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.md,
    gap: Spacing.lg,
  },
  actionsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButtonHalf: {
    flex: 1,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: "uppercase",
  },
  doodlesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  palettesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  sectionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
