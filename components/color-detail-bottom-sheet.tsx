import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Color } from '@/types';

export type ColorDetailParams = {
  color: Color;
  displayName: string;
  brandName: string;
  seriesName: string;
};

type Props = {
  color: ColorDetailParams | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

export function ColorDetailContent({
  color,
  isFavorite,
  onToggleFavorite,
}: Props) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const isLight =
    color?.color.hex.toLowerCase() === '#ffffff' ||
    color?.color.hex.toLowerCase().startsWith('#fff');

  if (!color) return null;

  return (
    <BottomSheetScrollView
      style={[styles.scroll, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <View
        style={[
          styles.swatch,
          { backgroundColor: color.color.hex },
          isLight && { borderWidth: 1, borderColor: theme.border },
        ]}
      />
      <View style={styles.titleRow}>
        <ThemedText type="title" style={[styles.name, { flex: 1 }]} numberOfLines={1} ellipsizeMode="tail">
          {color.displayName}
        </ThemedText>
        <TouchableOpacity
          style={styles.favoriteBtn}
          onPress={onToggleFavorite}
          accessibilityLabel={isFavorite ? t('colors.removeFromFavorites') : t('colors.addToFavorites')}
        >
          <IconSymbol
            name={isFavorite ? 'star.fill' : 'star'}
            size={24}
            color={isFavorite ? theme.warning : theme.icon}
          />
        </TouchableOpacity>
      </View>
      <ThemedText style={[styles.code, { color: theme.textSecondary }]}>
        {color.color.code}
      </ThemedText>
      <ThemedText style={[styles.meta, { color: theme.textSecondary }]}>
        {color.brandName} · {color.seriesName}
      </ThemedText>

      <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
        {t('colors.colorDetail.similarInBrand')}
      </ThemedText>
      <ThemedText style={[styles.placeholder, { color: theme.textSecondary }]}>
        {t('colors.colorDetail.comingSoon')}
      </ThemedText>

      <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
        {t('colors.colorDetail.similarOtherBrands')}
      </ThemedText>
      <ThemedText style={[styles.placeholder, { color: theme.textSecondary }]}>
        {t('colors.colorDetail.comingSoon')}
      </ThemedText>
    </BottomSheetScrollView>
  );
}

const SWATCH_SIZE = 160;

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: Spacing.xs,
  },
  favoriteBtn: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: BorderRadius.xl,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  name: {
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  code: {
    textAlign: 'center',
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs,
  },
  meta: {
    textAlign: 'center',
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  placeholder: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.md,
  },
});
