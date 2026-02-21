import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation, useRouter } from "expo-router";
import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  getAllSeriesWithCount,
  SeriesWithCountAndBrand,
} from "@/stores/useCatalogStore";

export default function CreatePaletteSelectScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const allSeries = useMemo(() => getAllSeriesWithCount(), []);
  const [selectedSeriesIds, setSelectedSeriesIds] = useState<Set<string>>(
    new Set(),
  );

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: "none" } });
    navigation.setOptions({ title: t("palettes.selectSeries") });
    return () => {
      navigation.getParent()?.setOptions({ tabBarStyle: undefined });
    };
  }, [navigation, t]);

  const toggleSeriesSelection = useCallback((seriesId: string) => {
    setSelectedSeriesIds((prev) => {
      const next = new Set(prev);
      if (next.has(seriesId)) next.delete(seriesId);
      else next.add(seriesId);
      return next;
    });
  }, []);

  const selectedCount = selectedSeriesIds.size;
  const canContinue = selectedCount > 0;

  const handleContinue = useCallback(() => {
    if (!canContinue) return;
    const ids = [...selectedSeriesIds].join(",");
    router.push({
      pathname: "/(tabs)/palettes/create/explore",
      params: { seriesIds: ids },
    });
  }, [canContinue, router, selectedSeriesIds]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
        {t("palettes.selectSeriesSubtitle")}
      </ThemedText>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {allSeries.map((s: SeriesWithCountAndBrand) => {
          const isSelected = selectedSeriesIds.has(s.id);
          return (
            <TouchableOpacity
              key={s.id}
              style={[styles.seriesRow, { borderBottomColor: theme.border }]}
              onPress={() => toggleSeriesSelection(s.id)}
              activeOpacity={0.7}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
            >
              {isSelected ? (
                <MaterialIcons name="check-box" size={24} color={theme.tint} />
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
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.background }]}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleContinue}
          disabled={!canContinue}
        >
          {t("palettes.continue")}
        </Button>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.md,
    paddingTop: Spacing.xs,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
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
  footer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
});
