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
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getAllSeriesWithCount,
  type SeriesWithCountAndBrand,
} from '@/stores/useCatalogStore';
import { useFavoritesStore } from '@/stores/useFavoritesStore';

function SeriesCard({
  series,
  isFavorite,
  onPress,
  onFavorite,
}: {
  series: SeriesWithCountAndBrand;
  isFavorite: boolean;
  onPress: () => void;
  onFavorite: () => void;
}) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
    >
      <TouchableOpacity
        style={styles.favoriteBtn}
        onPress={onFavorite}
        accessibilityLabel={isFavorite ? t('colors.removeFromFavorites') : t('colors.addToFavorites')}
      >
        <IconSymbol
          name={isFavorite ? 'star.fill' : 'star'}
          size={22}
          color={isFavorite ? theme.warning : theme.icon}
        />
      </TouchableOpacity>
      <ThemedText style={styles.cardTitle} numberOfLines={2}>{series.name}</ThemedText>
      <ThemedText style={[styles.cardMeta, { color: theme.textSecondary }]} numberOfLines={1}>
        {series.brandName} · {t('colors.colorCount', { count: series.colorCount })}
      </ThemedText>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const favoriteSeriesIds = useFavoritesStore((s) => s.favoriteSeriesIds);
  const toggleFavoriteSeries = useFavoritesStore((s) => s.toggleFavoriteSeries);

  const allSeries = useMemo(() => getAllSeriesWithCount(), []);
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
          {t('home.title')}
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          {t('colors.overviewSubtitle')}
        </ThemedText>

        <ThemedText style={[styles.sectionTitle, styles.sectionTitleSpaced, { color: theme.textSecondary }]}>
          {t('colors.favoriteSeries')}
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
            <View style={[styles.emptyIconWrap, { backgroundColor: theme.card }]}>
              <MaterialIcons name="palette" size={20} color={theme.tint} />
            </View>
            <ThemedText style={[styles.emptyTitle, { color: theme.text }]} numberOfLines={2}>
              {t('colors.emptySeriesTitle')}
            </ThemedText>
          </View>
        ) : (
          <View style={styles.sectionGrid}>
            {favoriteSeries.map((series: SeriesWithCountAndBrand) => (
              <SeriesCard
                key={series.id}
                series={series}
                isFavorite
                onPress={() => router.push({ pathname: '/(tabs)/colors', params: { seriesId: series.id } })}
                onFavorite={() => toggleFavoriteSeries(series.id)}
              />
            ))}
          </View>
        )}

        <ThemedText style={[styles.sectionTitle, styles.sectionTitleSpaced, { color: theme.textSecondary }]}>
          {t('colors.allSeriesTitle')}
        </ThemedText>
        <View style={styles.sectionGrid}>
          {allSeries.map((series: SeriesWithCountAndBrand) => (
            <SeriesCard
              key={series.id}
              series={series}
              isFavorite={favoriteSeriesIds.includes(series.id)}
              onPress={() => router.push({ pathname: '/(tabs)/colors', params: { seriesId: series.id } })}
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
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    marginBottom: Spacing.lg,
    opacity: 0.9,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    textTransform: 'uppercase',
  },
  sectionTitleSpaced: {
    marginBottom: Spacing.sm,
  },
  emptyCard: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    ...Shadows.sm,
  },
  emptyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    width: '100%',
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
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
  favoriteBtn: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    padding: Spacing.xs,
    zIndex: 1,
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
