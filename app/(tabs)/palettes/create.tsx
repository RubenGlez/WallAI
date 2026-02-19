import { useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getBrandsWithCount,
  getSeriesWithCountByBrandId,
} from '@/stores/useCatalogStore';
import type { SeriesWithCount } from '@/types';

type CheckState = 'none' | 'some' | 'all';

function getBrandCheckState(
  brandId: string,
  selectedSeriesIds: Set<string>,
  seriesByBrand: Map<string, SeriesWithCount[]>
): CheckState {
  const series = seriesByBrand.get(brandId) ?? [];
  if (series.length === 0) return 'none';
  const selected = series.filter((s) => selectedSeriesIds.has(s.id)).length;
  if (selected === 0) return 'none';
  if (selected === series.length) return 'all';
  return 'some';
}

export default function CreatePaletteSelectScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const brands = useMemo(() => getBrandsWithCount(), []);
  const seriesByBrand = useMemo(() => {
    const map = new Map<string, SeriesWithCount[]>();
    for (const b of brands) {
      map.set(b.id, getSeriesWithCountByBrandId(b.id));
    }
    return map;
  }, [brands]);

  const [expandedBrandIds, setExpandedBrandIds] = useState<Set<string>>(new Set());
  const [selectedSeriesIds, setSelectedSeriesIds] = useState<Set<string>>(new Set());

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('palettes.selectBrandsAndSeries') });
  }, [navigation, t]);

  const toggleBrandExpanded = useCallback((brandId: string) => {
    setExpandedBrandIds((prev) => {
      const next = new Set(prev);
      if (next.has(brandId)) next.delete(brandId);
      else next.add(brandId);
      return next;
    });
  }, []);

  const toggleBrandSelection = useCallback(
    (brandId: string) => {
      const series = seriesByBrand.get(brandId) ?? [];
      const allSelected = series.every((s) => selectedSeriesIds.has(s.id));
      setSelectedSeriesIds((prev) => {
        const next = new Set(prev);
        if (allSelected) {
          series.forEach((s) => next.delete(s.id));
        } else {
          series.forEach((s) => next.add(s.id));
        }
        return next;
      });
    },
    [seriesByBrand, selectedSeriesIds]
  );

  const toggleSeriesSelection = useCallback((seriesId: string) => {
    setSelectedSeriesIds((prev) => {
      const next = new Set(prev);
      if (next.has(seriesId)) next.delete(seriesId);
      else next.add(seriesId);
      return next;
    });
  }, []);

  const selectedCount = selectedSeriesIds.size;
  const canContinue = selectedCount > 0;

  const handleContinue = useCallback(() => {
    if (!canContinue) return;
    // TODO: navigate to color explorer with selectedSeriesIds (e.g. create/explore)
    router.back();
  }, [canContinue, router]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
        {t('palettes.selectBrandsSubtitle')}
      </ThemedText>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {brands.map((brand) => {
          const series = seriesByBrand.get(brand.id) ?? [];
          const isExpanded = expandedBrandIds.has(brand.id);
          const checkState = getBrandCheckState(brand.id, selectedSeriesIds, seriesByBrand);

          return (
            <View key={brand.id} style={styles.brandBlock}>
              <View style={[styles.brandRow, { borderBottomColor: theme.border }]}>
                <TouchableOpacity
                  style={styles.checkboxHit}
                  onPress={() => toggleBrandSelection(brand.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: checkState === 'all' }}
                >
                  {checkState === 'none' && (
                    <MaterialIcons name="check-box-outline-blank" size={24} color={theme.icon} />
                  )}
                  {checkState === 'some' && (
                    <MaterialIcons name="indeterminate-check-box" size={24} color={theme.tint} />
                  )}
                  {checkState === 'all' && (
                    <MaterialIcons name="check-box" size={24} color={theme.tint} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.brandLabelWrap}
                  onPress={() => toggleBrandExpanded(brand.id)}
                  activeOpacity={0.7}
                >
                  <ThemedText style={styles.brandName} numberOfLines={1}>
                    {brand.name}
                  </ThemedText>
                  <ThemedText style={[styles.brandMeta, { color: theme.textSecondary }]}>
                    {t('colors.colorCount', { count: brand.colorCount })}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.chevron}
                  onPress={() => toggleBrandExpanded(brand.id)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <MaterialIcons
                    name={isExpanded ? 'expand-less' : 'expand-more'}
                    size={24}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              {isExpanded &&
                series.map((s) => {
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
                      <View style={styles.seriesIndent} />
                      {isSelected ? (
                        <MaterialIcons name="check-box" size={22} color={theme.tint} />
                      ) : (
                        <MaterialIcons name="check-box-outline-blank" size={22} color={theme.icon} />
                      )}
                      <ThemedText style={styles.seriesName} numberOfLines={1}>
                        {s.name}
                      </ThemedText>
                      <ThemedText style={[styles.seriesMeta, { color: theme.textSecondary }]}>
                        {t('colors.colorCount', { count: s.colorCount })}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <ThemedText style={[styles.footerHint, { color: theme.textSecondary }]}>
          {selectedCount > 0
            ? t('palettes.selectedSeriesCount', { count: selectedCount })
            : t('palettes.selectAtLeastOne')}
        </ThemedText>
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: theme.tint },
            !canContinue && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          <ThemedText style={[styles.continueButtonText, { color: theme.background }]}>
            {t('palettes.continue')}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.md,
    paddingTop: Spacing.xs,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  brandBlock: {
    marginBottom: Spacing.xs,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  checkboxHit: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  brandLabelWrap: {
    flex: 1,
  },
  brandName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  brandMeta: {
    fontSize: Typography.fontSize.sm,
    marginTop: 2,
  },
  chevron: {
    padding: Spacing.xs,
  },
  seriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingLeft: Spacing.sm,
    borderBottomWidth: 1,
  },
  seriesIndent: {
    width: 24 + Spacing.sm,
  },
  seriesName: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    marginLeft: Spacing.sm,
  },
  seriesMeta: {
    fontSize: Typography.fontSize.sm,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    borderTopWidth: 1,
  },
  footerHint: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.sm,
  },
  continueButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
});
