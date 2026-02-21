import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback } from 'react';
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

export type ColorDetailBottomSheetRef = BottomSheetModal;

type ContentProps = {
  color: ColorDetailParams | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

export function ColorDetailContent({
  color,
  isFavorite,
  onToggleFavorite,
}: ContentProps) {
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
      <View style={styles.swatchWrap}>
        <View
          style={[
            styles.swatch,
            { backgroundColor: color.color.hex },
            isLight && { borderWidth: 1, borderColor: theme.border },
          ]}
        />
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
      <ThemedText type="title" style={styles.name} numberOfLines={1} ellipsizeMode="tail">
        {color.displayName}
      </ThemedText>
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

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  swatchWrap: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  swatch: {
    width: '100%',
    aspectRatio: 2.5,
    borderRadius: BorderRadius.xl,
  },
  favoriteBtn: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    padding: Spacing.xs,
    zIndex: 1,
  },
  name: {
    textAlign: 'left',
    marginBottom: Spacing.xs,
  },
  code: {
    textAlign: 'left',
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs,
  },
  meta: {
    textAlign: 'left',
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

type BottomSheetProps = ContentProps;

export const ColorDetailBottomSheet = forwardRef<
  ColorDetailBottomSheetRef,
  BottomSheetProps
>(function ColorDetailBottomSheet(
  { color, isFavorite, onToggleFavorite },
  ref
) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const renderBackdrop = useCallback(
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

  return (
    <BottomSheetModal
      ref={ref}
      backgroundStyle={{
        backgroundColor: theme.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
      backdropComponent={renderBackdrop}
    >
      <ColorDetailContent
        color={color}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
      />
    </BottomSheetModal>
  );
});
