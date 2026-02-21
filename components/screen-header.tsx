import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
};

export function ScreenHeader({ title, subtitle }: ScreenHeaderProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={styles.wrapper}>
      <ThemedText
        type="title"
        style={subtitle ? styles.titleWithSubtitle : styles.titleOnly}
      >
        {title}
      </ThemedText>
      {subtitle != null && (
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          {subtitle}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.lg,
  },
  titleWithSubtitle: {
    marginBottom: Spacing.sm,
  },
  titleOnly: {
    marginBottom: 0,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    lineHeight: 24,
    opacity: 0.9,
  },
});
