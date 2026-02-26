import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "@/components/button";
import { EmptyStateCard } from "@/components/empty-state-card";
import { FloatingActionButton } from "@/components/floating-action-button";
import { Screen } from "@/components/screen";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { getListCardWidth, LIST_GAP } from "@/constants/list-layout";
import { BorderRadius, Shadows, Spacing, Typography } from "@/constants/theme";
import { useImagePicker } from "@/hooks/use-image-picker";
import { useTheme } from "@/hooks/use-theme";
import { usePalettesStore } from "@/stores/usePalettesStore";
import type { Color, Palette } from "@/types";

const CARD_WIDTH = getListCardWidth();
const CARD_PADDING = Spacing.md;
const SWATCH_SIZE = (CARD_WIDTH - CARD_PADDING * 2) / 4 - 2;
const SWATCHES_TO_SHOW = 7;

function PaletteCard({
  palette,
  onPress,
}: {
  palette: Palette;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const swatches = palette.colors.slice(0, SWATCHES_TO_SHOW) as Color[];
  const extraCount =
    palette.colors.length > SWATCHES_TO_SHOW
      ? palette.colors.length - SWATCHES_TO_SHOW
      : 0;
  const isLight = (hex: string) =>
    hex.toLowerCase() === "#ffffff" || hex.toLowerCase().startsWith("#fff");

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.swatchRow}>
        {swatches.length > 0 ? (
          <>
            {swatches.map((c) => (
              <View
                key={c.id}
                style={[
                  styles.swatch,
                  { backgroundColor: c.hex },
                  isLight(c.hex) && {
                    borderWidth: 1,
                    borderColor: theme.border,
                  },
                ]}
              />
            ))}
            {extraCount > 0 && (
              <View style={styles.swatchMore}>
                <ThemedText
                  style={[
                    styles.swatchMoreText,
                    { color: theme.textSecondary },
                  ]}
                >
                  +{extraCount}
                </ThemedText>
              </View>
            )}
          </>
        ) : (
          <View
            style={[
              styles.swatchPlaceholder,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <IconSymbol
              name="swatchpalette"
              size={20}
              color={theme.textSecondary}
            />
          </View>
        )}
      </View>
      <ThemedText style={styles.cardTitle} numberOfLines={1}>
        {palette.name || t("common.untitled")}
      </ThemedText>
    </TouchableOpacity>
  );
}

export default function PalettesIndexScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme } = useTheme();
  const palettes = usePalettesStore((s) => s.palettes);
  const {
    pickFromGallery,
    takePhoto,
    loading: importLoading,
  } = useImagePicker();

  const handleCreateNew = () => {
    router.push("/palettes/create");
  };

  const handleOpenGallery = () => {
    pickFromGallery((uri) => {
      router.push({
        pathname: "/palettes/import",
        params: { imageUri: uri },
      });
    });
  };

  const handleOpenCamera = () => {
    takePhoto((uri) => {
      router.push({
        pathname: "/palettes/import",
        params: { imageUri: uri },
      });
    });
  };

  return (
    <Screen>
      <View style={styles.container}>
        <ScreenHeader
          title={t("palettes.myPalettes")}
          subtitle={t("palettes.subtitle")}
          right={
            <View style={styles.headerRightRow}>
              <Button
                variant="ghost"
                size="icon"
                onPress={handleOpenGallery}
                disabled={importLoading !== null}
                accessibilityLabel={t("palettes.selectFromGallery")}
                icon={
                  importLoading === "gallery" ? (
                    <ActivityIndicator size="small" color={theme.tint} />
                  ) : (
                    <IconSymbol
                      name="photo.on.rectangle.angled"
                      size={24}
                      color={theme.tint}
                    />
                  )
                }
              />
              <Button
                variant="ghost"
                size="icon"
                onPress={handleOpenCamera}
                disabled={importLoading !== null}
                accessibilityLabel={t("palettes.takePhoto")}
                icon={
                  importLoading === "camera" ? (
                    <ActivityIndicator size="small" color={theme.tint} />
                  ) : (
                    <IconSymbol
                      name="camera.fill"
                      size={24}
                      color={theme.tint}
                    />
                  )
                }
              />
            </View>
          }
        />

        <ScrollView showsVerticalScrollIndicator={false}>
          {palettes.length === 0 ? (
            <EmptyStateCard
              icon="swatchpalette"
              title={t("palettes.emptyTitle")}
              subtitle={t("palettes.emptyHint")}
              onPress={handleCreateNew}
            />
          ) : (
            <View style={styles.grid}>
              {palettes.map((palette) => (
                <PaletteCard
                  key={palette.id}
                  palette={palette}
                  onPress={() => {
                    router.push({
                      pathname: "/palettes/create",
                      params: { paletteId: palette.id },
                    });
                  }}
                />
              ))}
            </View>
          )}
        </ScrollView>

        <FloatingActionButton
          variant="primary"
          style={styles.fab}
          onPress={handleCreateNew}
          accessibilityLabel={t("palettes.createNew")}
          icon={<IconSymbol name="plus" size={28} color={theme.background} />}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  headerRightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  fab: {
    position: "absolute",
    bottom: Spacing.md,
    right: Spacing.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: CARD_WIDTH,
    padding: CARD_PADDING,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: LIST_GAP,
    ...Shadows.sm,
  },
  swatchRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
    marginBottom: Spacing.sm,
    minHeight: SWATCH_SIZE * 2 + 2,
  },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: BorderRadius.sm,
  },
  swatchPlaceholder: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  swatchMore: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  swatchMoreText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  cardTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
});
