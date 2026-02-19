import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function HomeScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <ThemedView style={styles.container} safeArea="top">
      <ThemedText type="title" style={styles.title}>
        {t('home.title')}
      </ThemedText>
      <ThemedText style={[styles.tagline, { color: theme.textSecondary }]}>
        {t('home.tagline')}
      </ThemedText>
      <ThemedText style={[styles.placeholder, { color: theme.textSecondary }]}>
        {t('home.placeholder')}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
  },
  title: {
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: Typography.fontSize.md,
    marginBottom: Spacing.xl,
    opacity: 0.9,
  },
  placeholder: {
    fontSize: Typography.fontSize.sm,
    fontStyle: 'italic',
  },
});
