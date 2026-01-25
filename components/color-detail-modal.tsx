import React from 'react';
import {
  Modal,
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ColorWithTranslations } from '@/types';
import { useCartStore } from '@/stores/useCartStore';
import { useColorsStore } from '@/stores/useColorsStore';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ColorDetailModalProps {
  visible: boolean;
  color: ColorWithTranslations | null;
  onClose: () => void;
}

export function ColorDetailModal({
  visible,
  color,
  onClose,
}: ColorDetailModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const { addColor, removeColor, isInCart } = useCartStore();
  const { getSeriesById, getBrandById } = useColorsStore();

  if (!color) return null;

  const series = getSeriesById(color.seriesId);
  const brand = series ? getBrandById(series.brandId) : undefined;
  const inCart = isInCart(color.id);

  const handleToggleCart = () => {
    if (inCart) {
      removeColor(color.id);
    } else {
      addColor(color);
    }
  };

  const theme = Colors[colorScheme];
  const name = color.translations?.en || color.code || 'Unknown Color';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <ThemedView style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Color Swatch */}
              <View
                style={[
                  styles.colorSwatch,
                  { backgroundColor: color.hex },
                  styles.colorSwatchLarge,
                ]}
              >
                <View
                  style={[
                    styles.colorSwatchBorder,
                    { borderColor: theme.border },
                  ]}
                />
              </View>

              {/* Color Info */}
              <View style={styles.infoSection}>
                <ThemedText type="title" style={styles.colorName}>
                  {name}
                </ThemedText>
                <ThemedText style={styles.colorCode}>Code: {color.code}</ThemedText>
                <ThemedText style={styles.colorHex}>Hex: {color.hex}</ThemedText>

                {series && (
                  <View style={styles.metaSection}>
                    <ThemedText style={styles.metaLabel}>Series:</ThemedText>
                    <ThemedText style={styles.metaValue}>{series.name}</ThemedText>
                  </View>
                )}

                {brand && (
                  <View style={styles.metaSection}>
                    <ThemedText style={styles.metaLabel}>Brand:</ThemedText>
                    <ThemedText style={styles.metaValue}>{brand.name}</ThemedText>
                  </View>
                )}

                {/* Translations */}
                {color.translations && Object.keys(color.translations).length > 0 && (
                  <View
                    style={[
                      styles.translationsSection,
                      { borderTopColor: theme.border },
                    ]}
                  >
                    <ThemedText style={styles.sectionTitle}>Translations:</ThemedText>
                    {Object.entries(color.translations).map(([lang, translation]) => (
                      <View key={lang} style={styles.translationRow}>
                        <ThemedText style={styles.translationLang}>
                          {lang.toUpperCase()}:
                        </ThemedText>
                        <ThemedText style={styles.translationText}>
                          {translation}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: inCart ? theme.error : theme.success,
                  },
                ]}
                onPress={handleToggleCart}
              >
                <ThemedText
                  style={[
                    styles.actionButtonText,
                    { color: '#FFFFFF' },
                  ]}
                >
                  {inCart ? 'Remove from Cart' : 'Add to Cart'}
                </ThemedText>
              </TouchableOpacity>
            </ScrollView>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <ThemedText style={styles.closeButtonText}>Close</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: '90%',
  },
  colorSwatch: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  colorSwatchLarge: {
    marginVertical: Spacing.md,
  },
  colorSwatchBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
  },
  infoSection: {
    marginBottom: Spacing.lg,
  },
  colorName: {
    fontSize: Typography.fontSize.xxl,
    marginBottom: Spacing.sm,
  },
  colorCode: {
    fontSize: Typography.fontSize.md,
    marginBottom: Spacing.xs,
    opacity: 0.7,
  },
  colorHex: {
    fontSize: Typography.fontSize.md,
    marginBottom: Spacing.md,
    opacity: 0.7,
  },
  metaSection: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  metaLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    marginRight: Spacing.sm,
  },
  metaValue: {
    fontSize: Typography.fontSize.md,
  },
  translationsSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  translationRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  translationLang: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginRight: Spacing.sm,
    minWidth: 40,
  },
  translationText: {
    fontSize: Typography.fontSize.sm,
    flex: 1,
  },
  actionButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  actionButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  closeButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  closeButtonText: {
    fontSize: Typography.fontSize.md,
    opacity: 0.7,
  },
});
