import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { SeriesWithCountAndBrand } from '@/stores/useCatalogStore';

export function SeriesCard({
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

const styles = StyleSheet.create({
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
