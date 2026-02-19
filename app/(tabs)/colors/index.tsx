import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getAllSeriesWithCount,
  getBrandsWithCount,
  type SeriesWithCountAndBrand,
} from '@/stores/useCatalogStore';
import { useFavoritesStore } from '@/stores/useFavoritesStore';
import type { BrandWithCount } from '@/types';

export default function ColorsOverviewScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const favoriteBrandIds = useFavoritesStore((s) => s.favoriteBrandIds);
  const favoriteSeriesIds = useFavoritesStore((s) => s.favoriteSeriesIds);

  const allBrands = useMemo(() => getBrandsWithCount(), []);
  const allSeries = useMemo(() => getAllSeriesWithCount(), []);

  const favoriteBrands = useMemo(
    () => allBrands.filter((b) => favoriteBrandIds.includes(b.id)),
    [allBrands, favoriteBrandIds]
  );
  const favoriteSeries = useMemo(
    () => allSeries.filter((s) => favoriteSeriesIds.includes(s.id)),
    [allSeries, favoriteSeriesIds]
  );

  return (
    <ThemedView style={styles.container} safeArea="top">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="title" style={styles.title}>
          {t('colors.overviewTitle')}
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          {t('colors.overviewSubtitle')}
        </ThemedText>

        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {t('colors.favoriteBrands')}
          </ThemedText>
          <TouchableOpacity onPress={() => router.push('/(tabs)/colors/brands')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ThemedText style={[styles.sectionLink, { color: theme.tint }]}>
              {t('colors.viewAll')}
            </ThemedText>
          </TouchableOpacity>
        </View>
        {favoriteBrands.length === 0 ? (
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.emptyCard,
              {
                backgroundColor: theme.backgroundSecondary,
                borderColor: theme.border,
              },
            ]}
            onPress={() => router.push('/(tabs)/colors/brands')}
          >
            <View style={[styles.emptyIconWrap, { backgroundColor: theme.card }]}>
              <MaterialIcons name="business" size={28} color={theme.tint} />
            </View>
            <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
              {t('colors.emptyBrandsTitle')}
            </ThemedText>
            <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              {t('colors.emptyBrandsHint')}
            </ThemedText>
          </TouchableOpacity>
        ) : (
          <View style={styles.sectionGrid}>
            {favoriteBrands.map((brand: BrandWithCount) => (
              <TouchableOpacity
                key={brand.id}
                activeOpacity={0.7}
                style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => router.push(`/(tabs)/colors/series/${brand.id}`)}
              >
                <ThemedText style={styles.cardTitle} numberOfLines={2}>{brand.name}</ThemedText>
                <ThemedText style={[styles.cardMeta, { color: theme.textSecondary }]}>
                  {t('colors.colorCount', { count: brand.colorCount })}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.sectionHeader}>
          <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {t('colors.favoriteSeries')}
          </ThemedText>
          <TouchableOpacity onPress={() => router.push('/(tabs)/colors/all-series')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ThemedText style={[styles.sectionLink, { color: theme.tint }]}>
              {t('colors.viewAll')}
            </ThemedText>
          </TouchableOpacity>
        </View>
        {favoriteSeries.length === 0 ? (
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.emptyCard,
              {
                backgroundColor: theme.backgroundSecondary,
                borderColor: theme.border,
              },
            ]}
            onPress={() => router.push('/(tabs)/colors/all-series')}
          >
            <View style={[styles.emptyIconWrap, { backgroundColor: theme.card }]}>
              <MaterialIcons name="palette" size={28} color={theme.tint} />
            </View>
            <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
              {t('colors.emptySeriesTitle')}
            </ThemedText>
            <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              {t('colors.emptySeriesHint')}
            </ThemedText>
          </TouchableOpacity>
        ) : (
          <View style={styles.sectionGrid}>
            {favoriteSeries.map((series: SeriesWithCountAndBrand) => (
              <TouchableOpacity
                key={series.id}
                activeOpacity={0.7}
                style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => router.push(`/(tabs)/colors/grid/${series.id}`)}
              >
                <ThemedText style={styles.cardTitle} numberOfLines={2}>{series.name}</ThemedText>
                <ThemedText style={[styles.cardMeta, { color: theme.textSecondary }]} numberOfLines={1}>
                  {series.brandName} · {t('colors.colorCount', { count: series.colorCount })}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}

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
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    marginBottom: Spacing.lg,
    opacity: 0.9,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
  },
  sectionLink: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  emptyCard: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    minHeight: 120,
    ...Shadows.sm,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
  sectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  card: {
    width: '48%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  cardTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  cardMeta: {
    fontSize: Typography.fontSize.sm,
  },
});
