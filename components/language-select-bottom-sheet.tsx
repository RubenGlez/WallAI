import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, { forwardRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SUPPORTED_LANGUAGES } from "@/stores/useLanguageStore";
import type { LanguageCode } from "@/types";

export type LanguageSelectBottomSheetRef = BottomSheetModal;

type Props = {
  currentLanguage: string;
  onSelectLanguage: (code: LanguageCode) => void;
};

export const LanguageSelectBottomSheet = forwardRef<
  LanguageSelectBottomSheetRef,
  Props
>(function LanguageSelectBottomSheet(
  { currentLanguage, onSelectLanguage },
  ref,
) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
      />
    ),
    [],
  );

  const handleSelect = useCallback(
    (code: LanguageCode) => {
      onSelectLanguage(code);
    },
    [onSelectLanguage],
  );

  return (
    <BottomSheetModal
      ref={ref}
      backgroundStyle={{
        backgroundColor: theme.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
      backdropComponent={renderBackdrop}
      enableDynamicSizing
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <ThemedText
          style={[styles.sectionLabel, { color: theme.textSecondary }]}
        >
          {t("profile.language")}
        </ThemedText>
        <View style={styles.list}>
          {SUPPORTED_LANGUAGES.map((code) => {
            const isSelected = currentLanguage === code;
            return (
              <TouchableOpacity
                key={code}
                style={[styles.row, { borderBottomColor: theme.border }]}
                onPress={() => handleSelect(code)}
                activeOpacity={0.7}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
              >
                <ThemedText style={styles.rowLabel}>
                  {t(`profile.lang_${code}` as const)}
                </ThemedText>
                {isSelected && (
                  <IconSymbol
                    name="checkmark.circle.fill"
                    size={22}
                    color={theme.tint}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
    textTransform: "uppercase",
  },
  list: {
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  rowLabel: {
    fontSize: Typography.fontSize.md,
  },
});
