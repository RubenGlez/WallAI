import {
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, { forwardRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Accent, BorderRadius, Spacing, Surface, Typography } from "@/constants/theme";
import { useSheetBackdrop } from "@/hooks/use-sheet-backdrop";
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
  const renderBackdrop = useSheetBackdrop();

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
        backgroundColor: Surface.highest,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
      }}
      backdropComponent={renderBackdrop}
      enableDynamicSizing
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <ThemedText type="label" style={styles.sectionLabel}>
          {t("profile.language")}
        </ThemedText>
        <View style={styles.list}>
          {SUPPORTED_LANGUAGES.map((code) => {
            const isSelected = currentLanguage === code;
            return (
              <TouchableOpacity
                key={code}
                style={[styles.row, isSelected && styles.rowSelected]}
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
                    color={Accent.primary}
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
    marginBottom: Spacing.md,
  },
  list: {
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Surface.high,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  rowSelected: {
    backgroundColor: Surface.bright,
  },
  rowLabel: {
    fontSize: Typography.fontSize.md,
  },
});
