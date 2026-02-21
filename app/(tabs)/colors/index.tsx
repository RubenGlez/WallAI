import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ColorDetailContent, type ColorDetailParams } from '@/components/color-detail-bottom-sheet';
import { ColorGridCard } from '@/components/color-grid-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getBrandById,
  getColorsBySeriesId,
  getAllSeriesWithCount,
  getSeriesById,
  type SeriesWithCountAndBrand,
} from '@/stores/useCatalogStore';
import { useFavoritesStore } from '@/stores/useFavoritesStore';
import type { Color } from '@/types';

const { width } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const GAP = Spacing.sm;
const HORIZONTAL_PADDING = Spacing.md;
const CARD_WIDTH = (width - HORIZONTAL_PADDING * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
const SWATCH_SIZE = CARD_WIDTH;

function getColorDisplayName(color: Color, language: string): string {
  const lang = language.split('-')[0];
  const names = color.name;
  if (!names || typeof names !== 'object') return color.code;
  const forLang = names[lang as keyof typeof names];
  if (forLang) return forLang;
  const first = Object.values(names)[0];
  return typeof first === 'string' ? first : color.code;
}

export default function ColorsOverviewScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const allSeries = useMemo(() => getAllSeriesWithCount(), []);
  const [selectedSeriesIds, setSelectedSeriesIds] = useState<Set<string>>(new Set());
  const hasInitializedSeriesSelection = useRef(false);

  useEffect(() => {
    if (allSeries.length > 0 && !hasInitializedSeriesSelection.current) {
      hasInitializedSeriesSelection.current = true;
      setSelectedSeriesIds(new Set(allSeries.map((s) => s.id)));
    }
  }, [allSeries]);

  const toggleSeriesSelection = useCallback((seriesId: string) => {
    setSelectedSeriesIds((prev) => {
      const next = new Set(prev);
      if (next.has(seriesId)) next.delete(seriesId);
      else next.add(seriesId);
      return next;
    });
  }, []);

  const allColors = useMemo(() => {
    const seen = new Set<string>();
    const out: Color[] = [];
    for (const seriesId of selectedSeriesIds) {
      const colors = getColorsBySeriesId(seriesId);
      for (const c of colors) {
        if (!seen.has(c.id)) {
          seen.add(c.id);
          out.push(c);
        }
      }
    }
    return out;
  }, [selectedSeriesIds]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [detailParams, setDetailParams] = useState<ColorDetailParams | null>(null);
  const detailSheetRef = useRef<BottomSheetModal>(null);
  const seriesFilterSheetRef = useRef<BottomSheetModal>(null);

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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: t('colors.overviewTitle'),
      headerStyle: { paddingTop: insets.top },
      headerRight: () => (
        <View style={styles.headerRightRow}>
          <TouchableOpacity
            onPress={() => setShowOnlyFavorites((s) => !s)}
            style={{ paddingHorizontal: Spacing.xs, paddingVertical: Spacing.sm }}
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
          <TouchableOpacity
            onPress={() => seriesFilterSheetRef.current?.present()}
            style={{ paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm }}
            accessibilityRole="button"
            accessibilityLabel={t('palettes.selectSeries')}
          >
            <MaterialIcons name="filter-list" size={24} color={theme.tint} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, insets.top, showOnlyFavorites, theme.tint, theme.icon, t]);

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

  const renderDetailBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
      />
    ),
    []
  );

  const renderSeriesSheetBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
      />
    ),
    []
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Color; index: number }) => (
      <View
        style={{
          width: CARD_WIDTH,
          marginRight: index % NUM_COLUMNS === NUM_COLUMNS - 1 ? 0 : GAP,
        }}
      >
        <ColorGridCard
          color={item}
          displayName={getColorDisplayName(item, i18n.language)}
          onPress={() => openDetailSheet(item)}
          isFavorite={favoriteColorIds.includes(item.id)}
          onFavorite={() => handleFavorite(item)}
          cardWidth={CARD_WIDTH}
          swatchSize={SWATCH_SIZE}
        />
      </View>
    ),
    [i18n.language, favoriteColorIds, openDetailSheet, handleFavorite]
  );

  return (
    <ThemedView style={styles.container} safeArea="top">
      <BottomSheetModal
        ref={detailSheetRef}
        backgroundStyle={{
          backgroundColor: theme.background,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
        backdropComponent={renderDetailBackdrop}
      >
        <ColorDetailContent
          color={detailParams}
          isFavorite={detailParams ? favoriteColorIds.includes(detailParams.color.id) : false}
          onToggleFavorite={() => detailParams && handleFavorite(detailParams.color)}
        />
      </BottomSheetModal>

      <BottomSheetModal
        ref={seriesFilterSheetRef}
        snapPoints={['60%', '90%']}
        backgroundStyle={{
          backgroundColor: theme.background,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
        backdropComponent={renderSeriesSheetBackdrop}
      >
        <BottomSheetScrollView contentContainerStyle={styles.seriesSheetContent}>
          <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            {t('palettes.selectSeries')}
          </ThemedText>
          <ThemedText style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            {t('palettes.selectSeriesSubtitle')}
          </ThemedText>
          <View style={styles.seriesList}>
            {allSeries.map((s: SeriesWithCountAndBrand) => {
              const isSelected = selectedSeriesIds.has(s.id);
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.seriesRow, { borderBottomColor: theme.border }]}
                  onPress={() => toggleSeriesSelection(s.id)}
                  activeOpacity={0.7}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                >
                  {isSelected ? (
                    <MaterialIcons name="check-box" size={24} color={theme.tint} />
                  ) : (
                    <MaterialIcons name="check-box-outline-blank" size={24} color={theme.icon} />
                  )}
                  <View style={styles.seriesLabelWrap}>
                    <ThemedText style={styles.seriesName} numberOfLines={1} ellipsizeMode="tail">
                      {s.name}
                    </ThemedText>
                    <ThemedText
                      style={[styles.seriesMeta, { color: theme.textSecondary }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {s.brandName} · {t('colors.colorCount', { count: s.colorCount })}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </BottomSheetScrollView>
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
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    paddingTop: GAP,
    paddingBottom: Spacing.xl,
  },
  row: {
    flexDirection: 'row',
    marginBottom: GAP,
  },
  seriesSheetContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.md,
  },
  seriesList: {
    marginBottom: Spacing.lg,
  },
  seriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  seriesLabelWrap: {
    flex: 1,
    marginLeft: Spacing.sm,
    minWidth: 0,
  },
  seriesName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  seriesMeta: {
    fontSize: Typography.fontSize.sm,
    marginTop: 2,
  },
});
