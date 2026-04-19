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

import { EmptyStateCard } from "@/components/empty-state-card";
import { FloatingActionButton } from "@/components/floating-action-button";
import { PaletteCard } from "@/components/palette-card";
import { Screen } from "@/components/screen";
import { ScreenHeader } from "@/components/screen-header";
import { SwipeableRow } from "@/components/swipeable-row";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Accent, BorderRadius, FontFamily, Spacing, Surface, Typography } from "@/constants/theme";
import { useImagePicker } from "@/hooks/use-image-picker";
import { confirmDelete } from "@/lib/confirm-delete";
import { usePalettesStore } from "@/stores/usePalettesStore";
import type { Palette } from "@/types";

function SwipeablePaletteCard({
  palette,
  onPress,
  onDelete,
}: {
  palette: Palette;
  onPress: () => void;
  onDelete: () => void;
}) {
  return (
    <SwipeableRow onDelete={onDelete}>
      <PaletteCard palette={palette} onPress={onPress} />
    </SwipeableRow>
  );
}

export default function PalettesIndexScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const palettes = usePalettesStore((s) => s.palettes);
  const removePalette = usePalettesStore((s) => s.removePalette);
  const { pickFromGallery, takePhoto, loading: importLoading } = useImagePicker();

  const handleCreateNew = () => router.push("/palettes/create");

  const handleOpenGallery = () => {
    pickFromGallery((uri) => router.push({ pathname: "/palettes/import", params: { imageUri: uri } }));
  };

  const handleOpenCamera = () => {
    takePhoto((uri) => router.push({ pathname: "/palettes/import", params: { imageUri: uri } }));
  };

  const handleDelete = (palette: Palette) => {
    confirmDelete({
      title: t("palettes.deleteTitle", { name: palette.name }),
      message: t("palettes.deleteMessage"),
      confirmLabel: t("common.delete"),
      cancelLabel: t("common.cancel"),
      onConfirm: () => removePalette(palette.id),
    });
  };

  return (
    <Screen>
      <View style={styles.container}>
        <ScreenHeader
          title={t("palettes.myPalettes")}
          subtitle={t("palettes.subtitle")}
          right={
            <View style={styles.importRow}>
              <TouchableOpacity
                style={styles.importBtn}
                onPress={handleOpenGallery}
                disabled={importLoading !== null}
                accessibilityLabel={t("palettes.selectFromGallery")}
              >
                {importLoading === "gallery" ? (
                  <ActivityIndicator size="small" color={Accent.primary} />
                ) : (
                  <IconSymbol name="photo.on.rectangle.angled" size={20} color={Accent.primary} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.importBtn}
                onPress={handleOpenCamera}
                disabled={importLoading !== null}
                accessibilityLabel={t("palettes.takePhoto")}
              >
                {importLoading === "camera" ? (
                  <ActivityIndicator size="small" color={Accent.primary} />
                ) : (
                  <IconSymbol name="camera.fill" size={20} color={Accent.primary} />
                )}
              </TouchableOpacity>
            </View>
          }
        />

        {/* Import hint — visible, not buried */}
        {palettes.length > 0 && (
          <TouchableOpacity style={styles.importBanner} onPress={handleOpenGallery} activeOpacity={0.8}>
            <IconSymbol name="sparkles" size={14} color={Accent.primary} />
            <ThemedText style={styles.importBannerText}>
              Import palette from photo
            </ThemedText>
            <IconSymbol name="arrow.right" size={12} color={Accent.onSurfaceMuted} />
          </TouchableOpacity>
        )}

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
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
                <SwipeablePaletteCard
                  key={palette.id}
                  palette={palette}
                  onPress={() => router.push({ pathname: "/palettes/create", params: { paletteId: palette.id } })}
                  onDelete={() => handleDelete(palette)}
                />
              ))}
            </View>
          )}
        </ScrollView>

        <FloatingActionButton
          style={styles.fab}
          onPress={handleCreateNew}
          accessibilityLabel={t("palettes.createNew")}
          icon={<IconSymbol name="plus" size={26} color={Accent.onPrimary} />}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  importRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  importBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: `${Accent.primary}18`,
    alignItems: "center",
    justifyContent: "center",
  },
  importBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Surface.base,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  importBannerText: {
    flex: 1,
    fontFamily: FontFamily.displayMedium,
    fontSize: Typography.fontSize.sm,
    color: Accent.onSurface,
  },
  scroll: {
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  fab: {
    position: "absolute",
    bottom: Spacing.md,
    right: Spacing.md,
  },
});
