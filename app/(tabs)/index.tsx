import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";

import { Screen } from "@/components/screen";
import { ScreenHeader } from "@/components/screen-header";
import { SeriesCard } from "@/components/series-card";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BorderRadius, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { getAllSeriesWithCount } from "@/stores/useCatalogStore";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { useProfileStore } from "@/stores/useProfileStore";
import type { SeriesWithCountAndBrand } from "@/types";

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme } = useTheme();
  const aka = useProfileStore((s) => s.aka);

  const favoriteSeriesIds = useFavoritesStore((s) => s.favoriteSeriesIds);
  const toggleFavoriteSeries = useFavoritesStore((s) => s.toggleFavoriteSeries);

  const allSeries = useMemo(() => getAllSeriesWithCount(), []);
  const favoriteSeries = useMemo(
    () => allSeries.filter((s) => favoriteSeriesIds.includes(s.id)),
    [allSeries, favoriteSeriesIds],
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

        <View>
          <ThemedText
            style={[styles.sectionTitle, { color: theme.textSecondary }]}
          >
            {t("colors.favoriteSeries")}
          </ThemedText>
          {favoriteSeries.length === 0 ? (
            <View
              style={[
                styles.emptyCard,
                {
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border,
                },
              ]}
            >
              <View
                style={[styles.emptyIconWrap, { backgroundColor: theme.card }]}
              >
                <IconSymbol name="swatchpalette" size={20} color={theme.tint} />
              </View>
              <ThemedText
                style={[styles.emptyTitle, { color: theme.text }]}
                numberOfLines={2}
              >
                {t("colors.emptySeriesTitle")}
              </ThemedText>
            </View>
          ) : (
            <View style={styles.sectionGrid}>
              {favoriteSeries.map((series: SeriesWithCountAndBrand) => (
                <SeriesCard
                  key={series.id}
                  series={series}
                  isFavorite
                  onPress={() => router.push(`/color-grid/${series.id}`)}
                  onFavorite={() => toggleFavoriteSeries(series.id)}
                />
              ))}
            </View>
          )}
        </View>

        <View>
          <ThemedText
            style={[styles.sectionTitle, { color: theme.textSecondary }]}
          >
            {t("colors.allSeriesTitle")}
          </ThemedText>
          <View style={styles.sectionGrid}>
            {allSeries.map((series: SeriesWithCountAndBrand) => (
              <SeriesCard
                key={series.id}
                series={series}
                isFavorite={favoriteSeriesIds.includes(series.id)}
                onPress={() => router.push(`/color-grid/${series.id}`)}
                onFavorite={() => toggleFavoriteSeries(series.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.md,
    gap: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: "uppercase",
    marginBottom: Spacing.sm,
  },
  emptyCard: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  emptyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    width: "100%",
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: "center",
  },
  sectionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
