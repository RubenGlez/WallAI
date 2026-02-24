import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ScreenHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
};

export function ScreenHeader({ title, subtitle, right }: ScreenHeaderProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <View style={styles.textContainer}>
          <ThemedText
            type="title"
            style={subtitle ? styles.titleWithSubtitle : styles.titleOnly}
          >
            {title}
          </ThemedText>
          {subtitle != null && (
            <ThemedText
              style={[styles.subtitle, { color: theme.textSecondary }]}
            >
              {subtitle}
            </ThemedText>
          )}
        </View>
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
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
