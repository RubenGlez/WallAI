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
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getBrandById, getColorsBySeriesId, getSeriesById } from '@/stores/useCatalogStore';
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

function ColorCard({
  color,
  displayName,
  onPress,
  onFavorite,
  onAddToPalette,
}: {
  color: Color;
  displayName: string;
  onPress: () => void;
  onFavorite: () => void;
  onAddToPalette: () => void;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const isLight = color.hex.toLowerCase() === '#ffffff' || color.hex.toLowerCase().startsWith('#fff');

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.swatch,
          { backgroundColor: color.hex },
          isLight && { borderWidth: 1, borderColor: theme.border },
        ]}
      />
      <ThemedText style={styles.name} numberOfLines={1} ellipsizeMode="tail">
        {displayName}
      </ThemedText>
      <ThemedText
        style={[styles.codeMeta, { color: theme.textSecondary }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {color.code}
      </ThemedText>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onFavorite}
          accessibilityLabel="Add to favorites"
        >
          <IconSymbol name="star" size={20} color={theme.icon} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onAddToPalette}
          accessibilityLabel="Add to palette"
        >
          <IconSymbol name="plus" size={20} color={theme.icon} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function ColorGridScreen() {
  const { seriesId } = useLocalSearchParams<{ seriesId: string }>();
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const [searchQuery, setSearchQuery] = useState('');
  const [detailParams, setDetailParams] = useState<ColorDetailParams | null>(null);
  const detailSheetRef = useRef<BottomSheetModal>(null);

  const series = seriesId ? getSeriesById(seriesId) : undefined;
  const allColors = seriesId ? getColorsBySeriesId(seriesId) : [];

  const filteredColors = useMemo(() => {
    if (!searchQuery.trim()) return allColors;
    const q = searchQuery.trim().toLowerCase();
    return allColors.filter((c) => {
      const name = getColorDisplayName(c, i18n.language);
      return c.code.toLowerCase().includes(q) || name.toLowerCase().includes(q);
    });
  }, [allColors, searchQuery, i18n.language]);

  useEffect(() => {
    if (series) {
      navigation.setOptions({ title: series.name });
    }
  }, [series, navigation]);

  const handleFavorite = useCallback((_color: Color) => {
    // TODO: add to favorites
  }, []);

  const handleAddToPalette = useCallback((_color: Color) => {
    // TODO: add to palette
  }, []);

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
      <ColorCard
        color={item}
        displayName={getColorDisplayName(item, i18n.language)}
        onPress={() => openDetailSheet(item)}
        onFavorite={() => handleFavorite(item)}
        onAddToPalette={() => handleAddToPalette(item)}
      />
    ),
    [i18n.language, openDetailSheet, handleFavorite, handleAddToPalette]
  );

  return (
    <ThemedView style={styles.container}>
      <BottomSheetModal
        ref={detailSheetRef}

      >
        <ColorDetailContent
          color={detailParams}
          onAddToPalette={() => detailParams && handleAddToPalette(detailParams.color)}
        />
      </BottomSheetModal>

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
  searchInput: {
    height: 44,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: Typography.fontSize.md,
    marginBottom: Spacing.md,
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
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: BorderRadius.md,
    alignSelf: 'center',
    marginBottom: Spacing.xs,
  },
  name: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: 2,
  },
  codeMeta: {
    fontSize: Typography.fontSize.xs,
    marginBottom: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    padding: Spacing.xs,
  },
});
