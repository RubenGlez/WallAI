import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBrandsWithCount } from '@/stores/useCatalogStore';
import { useFavoritesStore } from '@/stores/useFavoritesStore';
import type { BrandWithCount } from '@/types';

const { width } = Dimensions.get('window');
const NUM_COLUMNS = 2;
const GAP = Spacing.md;
const CARD_PADDING = Spacing.md;
const CARD_WIDTH = (width - Spacing.md * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
const LOGO_SIZE = CARD_WIDTH - CARD_PADDING * 2;

function BrandCard({
  brand,
  isFavorite,
  onPress,
  onFavorite,
}: {
  brand: BrandWithCount;
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
        <View style={styles.cardTopSpacer} />
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
      <View style={[styles.logoWrap, { backgroundColor: theme.backgroundSecondary }]}>
        {brand.logo ? (
          <Image
            source={typeof brand.logo === 'number' ? brand.logo : { uri: String(brand.logo) }}
            style={styles.logo}
            resizeMode="contain"
          />
        ) : (
          <ThemedText type="title" style={styles.logoInitial}>
            {brand.name.charAt(0)}
          </ThemedText>
        )}
      </View>
      <ThemedText numberOfLines={2} style={styles.brandName}>
        {brand.name}
      </ThemedText>
      <ThemedText style={[styles.meta, { color: theme.textSecondary }]}>
        {t('colors.colorCount', { count: brand.colorCount })}
      </ThemedText>
    </TouchableOpacity>
  );
}

export default function BrandSelectionScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const brands = useBrandsWithCount();
  const favoriteBrandIds = useFavoritesStore((s) => s.favoriteBrandIds);
  const toggleFavoriteBrand = useFavoritesStore((s) => s.toggleFavoriteBrand);

  const handleBrandPress = useCallback(
    (brandId: string) => {
      router.push(`/(tabs)/colors/series/${brandId}`);
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: BrandWithCount }) => (
      <BrandCard
        brand={item}
        isFavorite={favoriteBrandIds.includes(item.id)}
        onPress={() => handleBrandPress(item.id)}
        onFavorite={() => toggleFavoriteBrand(item.id)}
      />
    ),
    [handleBrandPress, favoriteBrandIds, toggleFavoriteBrand]
  );

  return (
    <ThemedView style={styles.container} safeArea="top">
      <ThemedText type="title" style={styles.title}>
        {t('colors.title')}
      </ThemedText>
      <ThemedText type="default" style={styles.subtitle}>
        {t('colors.brandsListDescription')}
      </ThemedText>

      <FlatList
        data={brands}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={NUM_COLUMNS}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
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
  row: {
    gap: GAP,
    marginBottom: GAP,
  },
  card: {
    width: CARD_WIDTH,
    padding: CARD_PADDING,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: Spacing.xs,
  },
  cardTopSpacer: {
    flex: 1,
  },
  favoriteBtn: {
    padding: Spacing.xs,
  },
  logoWrap: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: BorderRadius.md,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  logo: {
    width: LOGO_SIZE * 0.8,
    height: LOGO_SIZE * 0.8,
  },
  logoInitial: {
    fontSize: Typography.fontSize.display,
  },
  brandName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: 2,
  },
  meta: {
    fontSize: Typography.fontSize.xs,
  },
});
