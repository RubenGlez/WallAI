import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ColorDetailContent, type ColorDetailParams } from '@/components/color-detail-bottom-sheet';
import { ColorGridCard } from '@/components/color-grid-card';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getBrandById, getColorsBySeriesId, getSeriesById } from '@/stores/useCatalogStore';
import { useFavoritesStore } from '@/stores/useFavoritesStore';
import type { Color } from '@/types';

const { width } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const GAP = Spacing.sm;
const CARD_PADDING = Spacing.sm;
const CARD_WIDTH = (width - Spacing.md * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
const SWATCH_SIZE = CARD_WIDTH - CARD_PADDING * 2;

function getColorDisplayName(color: Color, language: string): string {
  const lang = language.split('-')[0];
  const names = color.name;
  if (!names || typeof names !== 'object') return color.code;
  const forLang = names[lang as keyof typeof names];
  if (forLang) return forLang;
  const first = Object.values(names)[0];
  return typeof first === 'string' ? first : color.code;
}

export default function ColorGridScreen() {
  const { seriesId } = useLocalSearchParams<{ seriesId: string }>();
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [detailParams, setDetailParams] = useState<ColorDetailParams | null>(null);
  const detailSheetRef = useRef<BottomSheetModal>(null);

  const series = seriesId ? getSeriesById(seriesId) : undefined;
  const allColors = useMemo(
    () => (seriesId ? getColorsBySeriesId(seriesId) : []),
    [seriesId]
  );

  const favoriteColorIds = useFavoritesStore((s) => s.favoriteColorIds);

  const filteredColors = useMemo(() => {
    let list = allColors;
    if (showOnlyFavorites) {
      list = list.filter((c) => favoriteColorIds.includes(c.id));
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.trim().toLowerCase();
    return list.filter((c) => {
      const name = getColorDisplayName(c, i18n.language);
      return c.code.toLowerCase().includes(q) || name.toLowerCase().includes(q);
    });
  }, [allColors, searchQuery, showOnlyFavorites, favoriteColorIds, i18n.language]);

  useEffect(() => {
    if (series) {
      navigation.setOptions({ title: series.name });
    }
  }, [series, navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setShowOnlyFavorites((s) => !s)}
          style={{ paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm }}
          accessibilityRole="button"
          accessibilityLabel={
            showOnlyFavorites ? t('colors.showAllColors') : t('colors.showOnlyFavorites')
          }
        >
          <IconSymbol
            name={showOnlyFavorites ? 'star.fill' : 'star'}
            size={24}
            color={showOnlyFavorites ? theme.tint : theme.icon}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, showOnlyFavorites, theme.tint, theme.icon, t]);

  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);

  const handleFavorite = useCallback(
    (color: Color) => {
      toggleFavorite(color.id);
    },
    [toggleFavorite]
  );

  const openDetailSheet = useCallback((item: Color) => {
    const s = getSeriesById(item.seriesId);
    const brand = s ? getBrandById(s.brandId) : undefined;
    setDetailParams({
      color: item,
      displayName: getColorDisplayName(item, i18n.language),
      brandName: brand?.name ?? '—',
      seriesName: s?.name ?? '—',
    });
    detailSheetRef.current?.present();
  }, [i18n.language]);

  const renderItem = useCallback(
    ({ item }: { item: Color }) => (
      <ColorGridCard
        color={item}
        displayName={getColorDisplayName(item, i18n.language)}
        onPress={() => openDetailSheet(item)}
        isFavorite={favoriteColorIds.includes(item.id)}
        onFavorite={() => handleFavorite(item)}
        cardWidth={CARD_WIDTH}
        swatchSize={SWATCH_SIZE}
      />
    ),
    [i18n.language, favoriteColorIds, openDetailSheet, handleFavorite]
  );

  return (
    <ThemedView style={styles.container}>
      <BottomSheetModal
        ref={detailSheetRef}

      >
        <ColorDetailContent
          color={detailParams}
          isFavorite={detailParams ? favoriteColorIds.includes(detailParams.color.id) : false}
          onToggleFavorite={() => detailParams && handleFavorite(detailParams.color)}
        />
      </BottomSheetModal>

      <View style={styles.searchWrap}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.backgroundSecondary,
              borderColor: theme.border,
              color: theme.text,
            },
          ]}
          placeholder={t('colors.searchPlaceholder')}
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.searchClearBtn}
            onPress={() => setSearchQuery('')}
            accessibilityRole="button"
            accessibilityLabel={t('common.clear')}
          >
            <IconSymbol name="xmark.circle.fill" size={22} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredColors}
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
  searchWrap: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  searchInput: {
    height: 44,
    paddingHorizontal: Spacing.md,
    paddingRight: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: Typography.fontSize.md,
  },
  searchClearBtn: {
    position: 'absolute',
    right: Spacing.sm,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    padding: Spacing.xs,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  row: {
    gap: GAP,
    marginBottom: GAP,
  },
});
