import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getBrandById, getSeriesWithCountByBrandId } from '@/stores/useCatalogStore';
import type { SeriesWithCount } from '@/types';

function SeriesCard({
  series,
  onPress,
}: {
  series: SeriesWithCount;
  onPress: () => void;
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
      <ThemedText style={styles.seriesName}>{series.name}</ThemedText>
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
              onPress={() => handleSeriesPress(item.id)}
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
  seriesName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
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
