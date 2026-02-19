import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getAllSeriesWithCount, type SeriesWithCountAndBrand } from '@/stores/useCatalogStore';
import { useFavoritesStore } from '@/stores/useFavoritesStore';

function SeriesRow({
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
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardTopRow}>
        <ThemedText style={styles.seriesName} numberOfLines={1}>
          {series.name}
        </ThemedText>
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
      </View>
      <ThemedText style={[styles.meta, { color: theme.textSecondary }]}>
        {series.brandName} · {t('colors.colorCount', { count: series.colorCount })}
      </ThemedText>
    </TouchableOpacity>
  );
}

export default function AllSeriesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const seriesList = useMemo(() => getAllSeriesWithCount(), []);
  const favoriteSeriesIds = useFavoritesStore((s) => s.favoriteSeriesIds);
  const toggleFavoriteSeries = useFavoritesStore((s) => s.toggleFavoriteSeries);

  return (
    <ThemedView style={styles.container} safeArea="top">
      <ThemedText type="title" style={styles.title}>
        {t('colors.allSeriesTitle')}
      </ThemedText>
      <ThemedText type="default" style={styles.subtitle}>
        {t('colors.seriesListDescription')}
      </ThemedText>

      <FlatList
        data={seriesList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SeriesRow
            series={item}
            isFavorite={favoriteSeriesIds.includes(item.id)}
            onPress={() => router.push(`/(tabs)/colors/grid/${item.id}`)}
            onFavorite={() => toggleFavoriteSeries(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    marginBottom: Spacing.md,
    opacity: 0.8,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  separator: {
    height: Spacing.sm,
  },
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  seriesName: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  favoriteBtn: {
    padding: Spacing.xs,
  },
  meta: {
    fontSize: Typography.fontSize.sm,
  },
});
