import { useTranslation } from 'react-i18next';
import { StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeStore } from '@/stores/useThemeStore';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const setColorSchemeOverride = useThemeStore((s) => s.setColorSchemeOverride);
  const isDark = colorScheme === 'dark';

  return (
    <ThemedView style={styles.container} safeArea="top">
      <ThemedText type="title" style={styles.title}>
        {t('tabs.profile')}
      </ThemedText>

      <View style={[styles.section, { borderTopColor: theme.border }]}>
        <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          {t('profile.appearance')}
        </ThemedText>
        <View style={[styles.row, { borderBottomColor: theme.border }]}>
          <ThemedText style={styles.rowLabel}>{t('profile.darkMode')}</ThemedText>
          <Switch
            value={isDark}
            onValueChange={(value) => setColorSchemeOverride(value ? 'dark' : 'light')}
            trackColor={{ false: theme.border, true: theme.tint }}
            thumbColor={theme.background}
          />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
  },
  title: {
    marginBottom: Spacing.lg,
  },
  section: {
    borderTopWidth: 1,
    paddingTop: Spacing.md,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  rowLabel: {
    fontSize: 16,
  },
});
