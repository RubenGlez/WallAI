import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getBrandById, getSeriesWithCountByBrandId } from '@/stores/useCatalogStore';
import { useFavoritesStore } from '@/stores/useFavoritesStore';
import type { SeriesWithCount } from '@/types';

function SeriesCard({
  series,
  isFavorite,
  onPress,
  onFavorite,
}: {
  series: SeriesWithCount;
  isFavorite: boolean;
  onPress: () => void;
  onFavorite: () => void;
}) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const finishLabel = series.finishType
    ? t(`colors.finishType_${series.finishType}`)
    : '—';
  const pressureLabel = series.pressureType
    ? t(`colors.pressureType_${series.pressureType}`)
    : '—';

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
      <View style={styles.metaRow}>
        <ThemedText style={[styles.meta, { color: theme.textSecondary }]}>
          {t('colors.finishLabel')}: {finishLabel}
        </ThemedText>
      </View>
      <View style={styles.metaRow}>
        <ThemedText style={[styles.meta, { color: theme.textSecondary }]}>
          {t('colors.pressureLabel')}: {pressureLabel}
        </ThemedText>
      </View>
      <ThemedText style={[styles.meta, styles.colorCount, { color: theme.textSecondary }]}>
        {t('colors.colorCount', { count: series.colorCount })}
      </ThemedText>
    </TouchableOpacity>
  );
}

export default function SeriesScreen() {
  const { brandId } = useLocalSearchParams<{ brandId: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const { t } = useTranslation();
  const theme = Colors[useColorScheme() ?? 'light'];

  const brand = brandId ? getBrandById(brandId) : undefined;
  const series = brandId ? getSeriesWithCountByBrandId(brandId) : [];
  const favoriteSeriesIds = useFavoritesStore((s) => s.favoriteSeriesIds);
  const toggleFavoriteSeries = useFavoritesStore((s) => s.toggleFavoriteSeries);

  useEffect(() => {
    if (brand) {
      navigation.setOptions({ title: brand.name });
    }
  }, [brand, navigation]);

  const handleSeriesPress = (seriesId: string) => {
    router.push(`/(tabs)/colors/grid/${seriesId}`);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText  style={styles.description}>
        {t('colors.seriesListDescription')}
      </ThemedText>

      {series.length === 0 ? (
        <ThemedText style={[styles.empty, { color: theme.textSecondary }]}>
          {t('colors.noSeries')}
        </ThemedText>
      ) : (
        <FlatList
          data={series}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SeriesCard
              series={item}
              isFavorite={favoriteSeriesIds.includes(item.id)}
              onPress={() => handleSeriesPress(item.id)}
              onFavorite={() => toggleFavoriteSeries(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  description: {
    marginBottom: Spacing.md,
    opacity: 0.9,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  seriesName: {
    flex: 1,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  favoriteBtn: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  metaRow: {
    marginBottom: 2,
  },
  meta: {
    fontSize: Typography.fontSize.sm,
  },
  colorCount: {
    marginTop: Spacing.xs,
  },
  empty: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
});
