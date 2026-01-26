import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useColorsStore } from '@/stores/useColorsStore';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface FilterDropdownProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  selectedBrandId: string | null;
  selectedSeriesId: string | null;
  onBrandSelect: (brandId: string | null) => void;
  onSeriesSelect: (seriesId: string | null) => void;
  onClearFilters: () => void;
  children: React.ReactNode;
}

export function FilterDropdown({
  open,
  onOpen,
  onClose,
  selectedBrandId,
  selectedSeriesId,
  onBrandSelect,
  onSeriesSelect,
  onClearFilters,
  children,
}: FilterDropdownProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { brands, series, getSeriesByBrandId } = useColorsStore();

  const availableSeries = useMemo(() => {
    if (selectedBrandId) {
      return getSeriesByBrandId(selectedBrandId);
    }
    return series;
  }, [selectedBrandId, series, getSeriesByBrandId]);

  const hasActiveFilters = selectedBrandId !== null || selectedSeriesId !== null;

  return (
    <Drawer
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      drawerPosition="right"
      drawerStyle={styles.drawerStyle}
      renderDrawerContent={() => {
        return (
        <ThemedView style={[styles.drawer, { width: '100%' }]} safeArea="top">
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <ThemedText type="title" style={styles.headerTitle}>
              {t('filters.title')}
            </ThemedText>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeIconButton}
            >
              <IconSymbol
                name="xmark.circle.fill"
                size={24}
                color={theme.text}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Brand Filter */}
            <View style={styles.filterSection}>
              <ThemedText style={styles.filterSectionTitle}>{t('filters.brand')}</ThemedText>
              <View style={styles.filterList}>
                <TouchableOpacity
                  style={[
                    styles.filterItem,
                    { borderBottomColor: theme.border },
                  ]}
                  onPress={() => onBrandSelect(null)}
                  activeOpacity={0.7}
                >
                  <View style={styles.filterItemContent}>
                    <IconSymbol
                      name={
                        selectedBrandId === null
                          ? 'checkmark.circle.fill'
                          : 'circle'
                      }
                      size={24}
                      color={
                        selectedBrandId === null
                          ? theme.tint
                          : theme.textSecondary
                      }
                    />
                    <ThemedText
                      style={[
                        styles.filterItemText,
                        selectedBrandId === null && [
                          styles.filterItemTextSelected,
                          { color: theme.tint },
                        ],
                      ]}
                    >
                      {t('filters.allBrands')}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
                {brands.map((brand) => (
                  <TouchableOpacity
                    key={brand.id}
                    style={[
                      styles.filterItem,
                      { borderBottomColor: theme.border },
                    ]}
                    onPress={() => onBrandSelect(brand.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.filterItemContent}>
                      <IconSymbol
                        name={
                          selectedBrandId === brand.id
                            ? 'checkmark.circle.fill'
                            : 'circle'
                        }
                        size={24}
                        color={
                          selectedBrandId === brand.id
                            ? theme.tint
                            : theme.textSecondary
                        }
                      />
                      <ThemedText
                        style={[
                          styles.filterItemText,
                          selectedBrandId === brand.id && [
                            styles.filterItemTextSelected,
                            { color: theme.tint },
                          ],
                        ]}
                      >
                        {brand.name}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Series Filter */}
            {selectedBrandId && (
              <View style={styles.filterSection}>
                <ThemedText style={styles.filterSectionTitle}>{t('filters.series')}</ThemedText>
                <View style={styles.filterList}>
                  <TouchableOpacity
                    style={[
                      styles.filterItem,
                      { borderBottomColor: theme.border },
                    ]}
                    onPress={() => onSeriesSelect(null)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.filterItemContent}>
                      <IconSymbol
                        name={
                          selectedSeriesId === null
                            ? 'checkmark.circle.fill'
                            : 'circle'
                        }
                        size={24}
                        color={
                          selectedSeriesId === null
                            ? theme.tint
                            : theme.textSecondary
                        }
                      />
                      <ThemedText
                        style={[
                          styles.filterItemText,
                          selectedSeriesId === null && [
                            styles.filterItemTextSelected,
                            { color: theme.tint },
                          ],
                        ]}
                      >
                        {t('filters.allSeries')}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                  {availableSeries.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      style={[
                        styles.filterItem,
                        { borderBottomColor: theme.border },
                      ]}
                      onPress={() => onSeriesSelect(s.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.filterItemContent}>
                        <IconSymbol
                          name={
                            selectedSeriesId === s.id
                              ? 'checkmark.circle.fill'
                              : 'circle'
                          }
                          size={24}
                          color={
                            selectedSeriesId === s.id
                              ? theme.tint
                              : theme.textSecondary
                          }
                        />
                        <ThemedText
                          style={[
                            styles.filterItemText,
                            selectedSeriesId === s.id && [
                              styles.filterItemTextSelected,
                              { color: theme.tint },
                            ],
                          ]}
                        >
                          {s.name}
                        </ThemedText>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <TouchableOpacity
                style={[
                  styles.clearButton,
                  { backgroundColor: theme.error },
                ]}
                onPress={onClearFilters}
              >
                <ThemedText
                  style={[styles.clearButtonText, { color: theme.background }]}
                >
                  {t('filters.clearAll')}
                </ThemedText>
              </TouchableOpacity>
            )}
          </ScrollView>
        </ThemedView>
        );
      }}
    >
      {children}
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawer: {
    flex: 1,
    width: '100%',
  },
  drawerStyle: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
  },
  closeIconButton: {
    padding: Spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: Spacing.md,
  },
  filterSection: {
    paddingBottom: Spacing.md,
  },
  filterSectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    opacity: 0.8,
  },
  filterList: {
    backgroundColor: 'transparent',
  },
  filterItem: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
  },
  filterItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  filterItemText: {
    fontSize: Typography.fontSize.md,
    flex: 1,
  },
  filterItemTextSelected: {
    fontWeight: Typography.fontWeight.semibold,
  },
  clearButton: {
    margin: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
});
