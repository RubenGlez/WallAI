import type { ReactNode } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useThemeColor } from "@/hooks/use-theme-color";

type HeaderBackButtonProps = {
  title?: string;
  right?: ReactNode;
};

export function HeaderBackButton({ title, right }: HeaderBackButtonProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const tint = useThemeColor({}, "tint");
  const { theme } = useTheme();

  return (
    <View style={styles.wrapper}>
      <View style={styles.left}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel={t("common.back")}
        >
          <IconSymbol name="chevron.left" size={24} color={tint} />
        </TouchableOpacity>
        {title ? (
          <ThemedText
            style={[styles.title, { color: theme.text }]}
            numberOfLines={1}
          >
            {title}
          </ThemedText>
        ) : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
    paddingRight: Spacing.sm,
    paddingVertical: Spacing.sm,
    minHeight: 44,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    flexShrink: 1,
  },
  backButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
});
