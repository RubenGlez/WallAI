import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, { forwardRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { SeriesWithCountAndBrand } from "@/types";

const SNAP_POINTS = ["60%", "90%"];

export type SeriesSelectBottomSheetRef = BottomSheetModal;

type Props = {
  series: SeriesWithCountAndBrand[];
  selectedSeriesIds: Set<string>;
  onToggleSeries: (seriesId: string) => void;
};

export const SeriesSelectBottomSheet = forwardRef<
  SeriesSelectBottomSheetRef,
  Props
>(function SeriesSelectBottomSheet(
  { series, selectedSeriesIds, onToggleSeries },
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

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={SNAP_POINTS}
      backgroundStyle={{
        backgroundColor: theme.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <ThemedText
          style={[styles.sectionLabel, { color: theme.textSecondary }]}
        >
          {t("palettes.selectSeries")}
        </ThemedText>
        <ThemedText
          style={[styles.sectionSubtitle, { color: theme.textSecondary }]}
        >
          {t("palettes.selectSeriesSubtitle")}
        </ThemedText>
        <View style={styles.seriesList}>
          {series.map((s) => {
            const isSelected = selectedSeriesIds.has(s.id);
            return (
              <TouchableOpacity
                key={s.id}
                style={[styles.seriesRow, { borderBottomColor: theme.border }]}
                onPress={() => onToggleSeries(s.id)}
                activeOpacity={0.7}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
              >
                {isSelected ? (
                  <MaterialIcons
                    name="check-box"
                    size={24}
                    color={theme.tint}
                  />
                ) : (
                  <MaterialIcons
                    name="check-box-outline-blank"
                    size={24}
                    color={theme.icon}
                  />
                )}
                <View style={styles.seriesLabelWrap}>
                  <ThemedText
                    style={styles.seriesName}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {s.name}
                  </ThemedText>
                  <ThemedText
                    style={[styles.seriesMeta, { color: theme.textSecondary }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {s.brandName} ·{" "}
                    {t("colors.colorCount", { count: s.colorCount })}
                  </ThemedText>
                </View>
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
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.md,
  },
  seriesList: {
    marginBottom: Spacing.lg,
  },
  seriesRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  seriesLabelWrap: {
    flex: 1,
    marginLeft: Spacing.sm,
    minWidth: 0,
  },
  seriesName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  seriesMeta: {
    fontSize: Typography.fontSize.sm,
    marginTop: 2,
  },
});
