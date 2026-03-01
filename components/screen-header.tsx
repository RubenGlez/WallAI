import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type ScreenHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
};

export function ScreenHeader({ title, subtitle, right }: ScreenHeaderProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.wrapper}>
      <View style={styles.titleContainer}>
        <ThemedText type="title">{title}</ThemedText>
        {right != null && <View>{right}</View>}
      </View>

      {subtitle != null && (
        <ThemedText type="default" style={{ color: theme.textSecondary }}>
          {subtitle}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
});
