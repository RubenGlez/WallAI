import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { DoodleCard } from "@/components/doodle-card";
import { PaletteCard } from "@/components/palette-card";
import { Screen } from "@/components/screen";
import { SeriesCard } from "@/components/series-card";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  Accent,
  BorderRadius,
  FontFamily,
  Spacing,
  Surface,
  Typography,
} from "@/constants/theme";
import { getAllSeriesWithCount } from "@/stores/useCatalogStore";
import { useDoodlesStore } from "@/stores/useDoodlesStore";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { usePalettesStore } from "@/stores/usePalettesStore";
import { useProfileStore } from "@/stores/useProfileStore";
import { useAnalytics } from "@/hooks/use-analytics";
import type { SeriesWithCountAndBrand } from "@/types";

const RECENT_PALETTES_COUNT = 4;
const FAVORITE_SERIES_COUNT = 6;

function QuickAction({
  icon,
  label,
  onPress,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  accent?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.quickAction, accent && styles.quickActionAccent]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.quickActionIcon}>{icon}</View>
      <ThemedText
        style={[
          styles.quickActionLabel,
          accent && styles.quickActionLabelAccent,
        ]}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

function SectionHeader({
  label,
  onSeeAll,
}: {
  label: string;
  onSeeAll?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <ThemedText type="label">{label}</ThemedText>
      {onSeeAll && (
        <TouchableOpacity
          onPress={onSeeAll}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ThemedText style={styles.seeAll}>See all</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const aka = useProfileStore((s) => s.aka);

  const doodles = useDoodlesStore((s) => s.doodles);
  const palettes = usePalettesStore((s) => s.palettes);

  const favoriteSeriesIds = useFavoritesStore((s) => s.favoriteSeriesIds);
  const toggleFavoriteSeries = useFavoritesStore((s) => s.toggleFavoriteSeries);
  const { captureSeriesFavorited } = useAnalytics();

  const allSeries = useMemo(() => getAllSeriesWithCount(), []);
  const favoriteSeriesPreview = useMemo(
    () =>
      allSeries
        .filter((s) => favoriteSeriesIds.includes(s.id))
        .slice(0, FAVORITE_SERIES_COUNT),
    [allSeries, favoriteSeriesIds],
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

  const greeting = aka.trim()
    ? t("home.titleWithName", { name: aka.trim() })
    : t("home.title");

  const showTagNudge = !aka.trim();

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.greetLabel} type="label">
            SprayDeck
          </ThemedText>
          <ThemedText type="title" style={styles.greeting}>
            {greeting}
          </ThemedText>
          <ThemedText style={styles.subGreeting}>
            {t("home.subtitle")}
          </ThemedText>
        </View>

        {/* Artist tag nudge */}
        {showTagNudge && (
          <TouchableOpacity
            style={styles.nudgeCard}
            onPress={() => router.push("/(tabs)/profile")}
            activeOpacity={0.75}
          >
            <View style={styles.nudgeIcon}>
              <IconSymbol name="person.fill" size={16} color={Accent.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.nudgeTitle}>{t("home.setTagNudge")}</ThemedText>
              <ThemedText style={styles.nudgeSubtitle}>{t("home.setTagNudgeSubtitle")}</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={14} color={Accent.onSurfaceMuted} />
          </TouchableOpacity>
        )}

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <QuickAction
            accent
            icon={
              <IconSymbol
                name="paintpalette.fill"
                size={20}
                color={Accent.primary}
              />
            }
            label={t("home.createPalette")}
            onPress={() => router.push("/palettes/create")}
          />
          <QuickAction
            accent
            icon={
              <IconSymbol
                name="square.stack.3d.up.fill"
                size={20}
                color={Accent.primary}
              />
            }
            label={t("home.newDoodle")}
            onPress={() => router.push("/doodles/create")}
          />
          <QuickAction
            icon={
              <IconSymbol
                name="square.grid.2x2"
                size={20}
                color={Accent.primary}
              />
            }
            label={t("home.exploreColors")}
            onPress={() => router.push("/(tabs)/catalog")}
          />
        </View>

        {/* Continue last doodle */}
        {lastDoodle && (
          <View style={styles.section}>
            <SectionHeader
              label={t("home.continueLastDoodle")}
              onSeeAll={() => router.push("/(tabs)/doodles")}
            />
            <View style={styles.grid}>
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
            <SectionHeader
              label={t("home.recentPalettes")}
              onSeeAll={() => router.push("/(tabs)/palettes")}
            />
            <View style={styles.grid}>
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

        {/* Favorite series */}
        {favoriteSeriesPreview.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              label={t("colors.favoriteSeries")}
              onSeeAll={() => router.push("/(tabs)/catalog")}
            />
            <View style={styles.grid}>
              {favoriteSeriesPreview.map((series: SeriesWithCountAndBrand) => (
                <SeriesCard
                  key={series.id}
                  series={series}
                  isFavorite
                  onPress={() => router.push(`/color-grid/${series.id}`)}
                  onFavorite={() => {
                    const isFav = favoriteSeriesIds.includes(series.id);
                    toggleFavoriteSeries(series.id);
                    if (!isFav) captureSeriesFavorited(series.id);
                  }}
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
  header: {
    paddingTop: Spacing.sm,
    gap: 2,
  },
  greetLabel: {
    color: Accent.primary,
    marginBottom: Spacing.xs,
  },
  greeting: {
    fontSize: 28,
  },
  subGreeting: {
    fontSize: Typography.fontSize.sm,
    color: Accent.onSurfaceMuted,
    marginTop: 4,
  },
  quickActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  quickAction: {
    flex: 1,
    backgroundColor: Surface.base,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: "flex-start",
    gap: Spacing.md,
    minHeight: 90,
  },
  quickActionAccent: {
    backgroundColor: `${Accent.primary}14`,
    borderWidth: 1,
    borderColor: `${Accent.primary}28`,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${Accent.primary}20`,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionLabel: {
    fontFamily: FontFamily.displaySemiBold,
    fontSize: Typography.fontSize.sm,
    color: Accent.onSurface,
  },
  quickActionLabelAccent: {
    color: Accent.primary,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  seeAll: {
    fontSize: Typography.fontSize.sm,
    color: Accent.primary,
    fontFamily: FontFamily.displayMedium,
  },
  section: {
    gap: Spacing.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  nudgeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${Accent.primary}0f`,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  nudgeIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: `${Accent.primary}20`,
    alignItems: "center",
    justifyContent: "center",
  },
  nudgeTitle: {
    fontFamily: FontFamily.displaySemiBold,
    fontSize: Typography.fontSize.sm,
    color: Accent.primary,
  },
  nudgeSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Accent.onSurfaceMuted,
    marginTop: 2,
  },
});
