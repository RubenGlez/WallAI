import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { Button } from "@/components/button";
import { EmptyStateCard } from "@/components/empty-state-card";
import { FloatingActionButton } from "@/components/floating-action-button";
import { PaletteCard } from "@/components/palette-card";
import { Screen } from "@/components/screen";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BorderRadius, Spacing } from "@/constants/theme";
import { useImagePicker } from "@/hooks/use-image-picker";
import { useTheme } from "@/hooks/use-theme";
import { usePalettesStore } from "@/stores/usePalettesStore";

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
});
