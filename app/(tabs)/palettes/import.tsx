import { useNavigation, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getColors } from 'react-native-image-colors';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  extractHexPalette,
  findClosestColor,
  type ColorMatch,
} from '@/lib/colorMatch';
import {
  getColorsBySeriesId,
  getBrandsWithCount,
  getSeriesWithCountByBrandId,
} from '@/stores/useCatalogStore';
import { usePalettesStore } from '@/stores/usePalettesStore';
import type { Color } from '@/types';
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

function getColorDisplayName(color: Color, language: string): string {
  const lang = language.split('-')[0];
  const names = color.name;
  if (!names || typeof names !== 'object') return color.code;
  const forLang = names[lang as keyof typeof names];
  if (forLang) return forLang;
  const first = Object.values(names)[0];
  return typeof first === 'string' ? first : color.code;
}

export default function ImportFromImageScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const addPalette = usePalettesStore((s) => s.addPalette);

  const brands = useMemo(() => getBrandsWithCount(), []);
  const seriesByBrand = useMemo(() => {
    const map = new Map<string, SeriesWithCount[]>();
    for (const b of brands) {
      map.set(b.id, getSeriesWithCountByBrandId(b.id));
    }
    return map;
  }, [brands]);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [extractedHexes, setExtractedHexes] = useState<string[]>([]);
  const [expandedBrandIds, setExpandedBrandIds] = useState<Set<string>>(new Set());
  const [selectedSeriesIds, setSelectedSeriesIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [paletteName, setPaletteName] = useState('');

  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({ title: t('palettes.importFromImage') });
  }, [navigation, t]);

  const processImageUri = useCallback(async (uri: string) => {
    setImageUri(uri);
    const colorsResult = await getColors(uri, { fallback: '#000000' });
    const hexes = extractHexPalette(colorsResult as Record<string, string>);
    setExtractedHexes(hexes);
    setSelectedSeriesIds(new Set());
  }, []);

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError(t('palettes.permissionDenied'));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });
      if (result.canceled || !result.assets[0]) {
        setLoading(false);
        return;
      }
      await processImageUri(result.assets[0].uri);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [t, processImageUri]);

  const takePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setError(t('palettes.cameraPermissionDenied'));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
      });
      if (result.canceled || !result.assets[0]) {
        setLoading(false);
        return;
      }
      await processImageUri(result.assets[0].uri);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [t, processImageUri]);

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

  const catalogColorsForMatch = useMemo(() => {
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

  const matches = useMemo(() => {
    if (extractedHexes.length === 0 || catalogColorsForMatch.length === 0) return [];
    const results: ColorMatch[] = [];
    for (const hex of extractedHexes) {
      const m = findClosestColor(hex, catalogColorsForMatch);
      if (m) results.push(m);
    }
    return results;
  }, [extractedHexes, catalogColorsForMatch]);

  const handleSavePalette = useCallback(() => {
    if (matches.length === 0) return;
    setShowNameModal(true);
  }, [matches.length]);

  const handleConfirmSave = useCallback(() => {
    const name = paletteName.trim() || t('palettes.defaultPaletteName');
    addPalette({
      name,
      colors: matches.map((m) => m.catalogColor),
    });
    setShowNameModal(false);
    setPaletteName('');
    router.replace('/(tabs)/palettes');
  }, [addPalette, paletteName, matches, t, router]);

  const handleEditManually = useCallback(() => {
    if (matches.length === 0) return;
    const seriesIds = [...new Set(matches.map((m) => m.catalogColor.seriesId))].join(',');
    const initialColorIds = matches.map((m) => m.catalogColor.id).join(',');
    router.push({
      pathname: '/(tabs)/palettes/create/explore',
      params: { seriesIds, initialColorIds },
    });
  }, [matches, router]);

  const hasImage = imageUri != null && extractedHexes.length > 0;
  const hasMatches = matches.length > 0;

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!hasImage && (
          <View style={styles.pickSection}>
            <ThemedText style={[styles.pickSectionSubtitle, { color: theme.textSecondary }]}>
              {t('palettes.choosePhotoSubtitle')}
            </ThemedText>
            {loading ? (
              <View style={styles.pickLoadingWrap}>
                <ActivityIndicator size="large" color={theme.tint} />
              </View>
            ) : (
              <View style={styles.pickButtonsRow}>
                <TouchableOpacity
                  style={[styles.pickOption, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
                  onPress={pickImage}
                >
                  <MaterialIcons name="photo-library" size={32} color={theme.tint} style={styles.pickOptionIcon} />
                  <ThemedText style={[styles.pickOptionTitle, { color: theme.tint }]}>
                    {t('palettes.selectFromGallery')}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.pickOption, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
                  onPress={takePhoto}
                >
                  <MaterialIcons name="camera-alt" size={32} color={theme.tint} style={styles.pickOptionIcon} />
                  <ThemedText style={[styles.pickOptionTitle, { color: theme.tint }]}>
                    {t('palettes.takePhoto')}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {error && (
          <ThemedText style={[styles.error, { color: theme.error }]}>{error}</ThemedText>
        )}

        {hasImage && (
          <>
            <View style={styles.thumbnailWrap}>
              <Image source={{ uri: imageUri! }} style={styles.thumbnail} resizeMode="cover" />
              <View style={styles.swatchRow}>
                {extractedHexes.map((hex) => (
                  <View
                    key={hex}
                    style={[
                      styles.miniSwatch,
                      { backgroundColor: hex },
                      (hex === '#ffffff' || hex.startsWith('#fff')) && {
                        borderWidth: 1,
                        borderColor: theme.border,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>

            <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              {t('palettes.selectBrandsAndSeries')}
            </ThemedText>
            <ThemedText style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
              {t('palettes.selectBrandsSubtitle')}
            </ThemedText>
            <View style={styles.brandList}>
              {brands.map((brand) => {
                const series = seriesByBrand.get(brand.id) ?? [];
                const isExpanded = expandedBrandIds.has(brand.id);
                const checkState = getBrandCheckState(brand.id, selectedSeriesIds, seriesByBrand);

                return (
                  <View key={brand.id} style={styles.brandBlock}>
                    <View style={[styles.brandRowWrap, { borderBottomColor: theme.border }]}>
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
            </View>

            {hasMatches && (
              <>
                <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                  {t('palettes.equivalents')}
                </ThemedText>
                {matches.map((match, i) => {
                  const name = getColorDisplayName(match.catalogColor, i18n.language);
                  return (
                    <View
                      key={`${match.originalHex}-${match.catalogColor.id}`}
                      style={[styles.matchRow, { borderColor: theme.border }]}
                    >
                      <View
                        style={[
                          styles.matchSwatch,
                          { backgroundColor: match.originalHex },
                          (match.originalHex === '#ffffff' || match.originalHex.startsWith('#fff')) && {
                            borderWidth: 1,
                            borderColor: theme.border,
                          },
                        ]}
                      />
                      <View
                        style={[
                          styles.matchSwatch,
                          { backgroundColor: match.catalogColor.hex },
                          (match.catalogColor.hex === '#ffffff' ||
                            match.catalogColor.hex.startsWith('#fff')) && {
                            borderWidth: 1,
                            borderColor: theme.border,
                          },
                        ]}
                      />
                      <View style={styles.matchInfo}>
                        <ThemedText style={styles.matchName} numberOfLines={1}>
                          {name}
                        </ThemedText>
                        <ThemedText style={[styles.matchCode, { color: theme.textSecondary }]}>
                          {match.catalogColor.code}
                        </ThemedText>
                      </View>
                      <ThemedText style={[styles.similarity, { color: theme.tint }]}>
                        {match.similarity}%
                      </ThemedText>
                    </View>
                  );
                })}

                <View style={styles.footerActions}>
                  <TouchableOpacity
                    style={[styles.primaryButton, { backgroundColor: theme.tint }]}
                    onPress={handleSavePalette}
                  >
                    <ThemedText style={[styles.primaryButtonText, { color: theme.background }]}>
                      {t('palettes.savePalette')}
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.secondaryButton, { borderColor: theme.border }]}
                    onPress={handleEditManually}
                  >
                    <ThemedText style={styles.secondaryButtonText}>
                      {t('palettes.editManually')}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>

      <Modal
        visible={showNameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNameModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowNameModal(false)}
          />
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <ThemedText style={styles.modalTitle}>{t('palettes.nameYourPalette')}</ThemedText>
            <TextInput
              style={[
                styles.nameInput,
                {
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder={t('palettes.paletteNamePlaceholder')}
              placeholderTextColor={theme.textSecondary}
              value={paletteName}
              onChangeText={setPaletteName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: theme.border }]}
                onPress={() => setShowNameModal(false)}
              >
                <ThemedText>{t('common.cancel')}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: theme.tint }]}
                onPress={handleConfirmSave}
              >
                <ThemedText style={[styles.modalButtonPrimaryText, { color: theme.background }]}>
                  {t('common.save')}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  pickSection: {
    marginBottom: Spacing.md,
  },
  pickSectionSubtitle: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  pickLoadingWrap: {
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  pickOption: {
    flex: 1,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  pickOptionIcon: {
    marginBottom: Spacing.sm,
  },
  pickOptionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
  },
  error: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.sm,
  },
  thumbnailWrap: {
    marginBottom: Spacing.lg,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  miniSwatch: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
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
  brandList: {
    marginBottom: Spacing.lg,
  },
  brandBlock: {
    marginBottom: Spacing.xs,
  },
  brandRowWrap: {
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
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    gap: Spacing.sm,
  },
  matchSwatch: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  matchCode: {
    fontSize: Typography.fontSize.sm,
  },
  similarity: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  footerActions: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  primaryButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  secondaryButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  nameInput: {
    height: 44,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: Typography.fontSize.md,
    marginBottom: Spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  modalButtonPrimary: {},
  modalButtonPrimaryText: {
    fontWeight: Typography.fontWeight.semibold,
  },
});
