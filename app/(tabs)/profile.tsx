import { useTranslation } from 'react-i18next';
import { StyleSheet, Switch, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProfileStore } from '@/stores/useProfileStore';
import { useThemeStore } from '@/stores/useThemeStore';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const aka = useProfileStore((s) => s.aka);
  const setAka = useProfileStore((s) => s.setAka);
  const setColorSchemeOverride = useThemeStore((s) => s.setColorSchemeOverride);
  const isDark = colorScheme === 'dark';

  return (
    <ThemedView style={styles.container} safeArea="top">
      <ThemedText type="title" style={styles.title}>
        {t('tabs.profile')}
      </ThemedText>

      <View style={[styles.section, { borderTopColor: theme.border }]}>
        <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
          {t('profile.akaSection')}
        </ThemedText>
        <TextInput
          style={[
            styles.akaInput,
            {
              backgroundColor: theme.backgroundSecondary,
              borderColor: theme.border,
              color: theme.text,
            },
          ]}
          placeholder={t('profile.akaPlaceholder')}
          placeholderTextColor={theme.textSecondary}
          value={aka}
          onChangeText={setAka}
          autoCapitalize="words"
          autoCorrect={false}
        />
        <ThemedText style={[styles.akaHint, { color: theme.textSecondary }]}>
          {t('profile.akaHint')}
        </ThemedText>
      </View>

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
  akaInput: {
    height: 48,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: Typography.fontSize.md,
    marginBottom: Spacing.xs,
  },
  akaHint: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.md,
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
