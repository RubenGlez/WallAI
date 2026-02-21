import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";

import { ScreenHeader } from "@/components/screen-header";
import { SeriesCard } from "@/components/series-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography
} from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  getAllSeriesWithCount,
  type SeriesWithCountAndBrand,
} from "@/stores/useCatalogStore";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { useProfileStore } from "@/stores/useProfileStore";

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const aka = useProfileStore((s) => s.aka);

  const favoriteSeriesIds = useFavoritesStore((s) => s.favoriteSeriesIds);
  const toggleFavoriteSeries = useFavoritesStore((s) => s.toggleFavoriteSeries);

  const allSeries = useMemo(() => getAllSeriesWithCount(), []);
  const favoriteSeries = useMemo(
    () => allSeries.filter((s) => favoriteSeriesIds.includes(s.id)),
    [allSeries, favoriteSeriesIds],
  );

  return (
    <ThemedView style={styles.container} safeArea="top">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title={
            aka.trim()
              ? t("home.titleWithName", { name: aka.trim() })
              : t("home.title")
          }
          subtitle={t("home.subtitle")}
        />

        <ThemedText
          style={[
            styles.sectionTitle,
            styles.sectionTitleSpaced,
            { color: theme.textSecondary },
          ]}
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
              <MaterialIcons name="palette" size={20} color={theme.tint} />
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

        <ThemedText
          style={[
            styles.sectionTitle,
            styles.sectionTitleSpaced,
            { color: theme.textSecondary },
          ]}
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
      </ScrollView>
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
    paddingBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: "uppercase",
  },
  sectionTitleSpaced: {
    marginBottom: Spacing.sm,
  },
  emptyCard: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    marginBottom: Spacing.sm,
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
    marginBottom: Spacing.lg,
  },
});
