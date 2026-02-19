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

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  extractHexPalette,
  findClosestColor,
  type ColorMatch,
} from '@/lib/colorMatch';
import { getColorsByBrandId, getBrandsWithCount } from '@/stores/useCatalogStore';
import { usePalettesStore } from '@/stores/usePalettesStore';
import type { Color } from '@/types';

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

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [extractedHexes, setExtractedHexes] = useState<string[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [matches, setMatches] = useState<ColorMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [paletteName, setPaletteName] = useState('');

  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({ title: t('palettes.importFromImage') });
  }, [navigation, t]);

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
      const uri = result.assets[0].uri;
      setImageUri(uri);
      const colorsResult = await getColors(uri, { fallback: '#000000' });
      const hexes = extractHexPalette(colorsResult as Record<string, string>);
      setExtractedHexes(hexes);
      setSelectedBrandId(null);
      setMatches([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

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
          <TouchableOpacity
            style={[styles.pickButton, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
            onPress={pickImage}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.tint} />
            ) : (
              <>
                <ThemedText style={[styles.pickButtonTitle, { color: theme.tint }]}>
                  {t('palettes.choosePhoto')}
                </ThemedText>
                <ThemedText style={[styles.pickButtonSubtitle, { color: theme.textSecondary }]}>
                  {t('palettes.choosePhotoSubtitle')}
                </ThemedText>
              </>
            )}
          </TouchableOpacity>
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
              {t('palettes.selectBrandForMatch')}
            </ThemedText>
            <View style={styles.brandList}>
              {brands.map((brand) => {
                const selected = selectedBrandId === brand.id;
                return (
                  <TouchableOpacity
                    key={brand.id}
                    style={[
                      styles.brandRow,
                      { borderColor: theme.border },
                      selected && { borderColor: theme.tint, borderWidth: 2 },
                    ]}
                    onPress={() => {
                      setSelectedBrandId(brand.id);
                      const catalogColors = getColorsByBrandId(brand.id);
                      const results: ColorMatch[] = [];
                      for (const hex of extractedHexes) {
                        const m = findClosestColor(hex, catalogColors);
                        if (m) results.push(m);
                      }
                      setMatches(results);
                    }}
                  >
                    <ThemedText style={styles.brandName}>{brand.name}</ThemedText>
                  </TouchableOpacity>
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
  pickButton: {
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
  pickButtonTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  pickButtonSubtitle: {
    fontSize: Typography.fontSize.sm,
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
  brandList: {
    marginBottom: Spacing.lg,
  },
  brandRow: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  brandName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
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
