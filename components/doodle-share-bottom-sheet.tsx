import {
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import React, { forwardRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Accent, BorderRadius, Spacing, Surface, Typography } from "@/constants/theme";
import { useSheetBackdrop } from "@/hooks/use-sheet-backdrop";

export type DoodleShareBottomSheetRef = BottomSheetModal;

type Props = {
  imageUri: string | null;
  onSaveToPhotos?: () => void;
  onShare?: () => void;
};

export const DoodleShareBottomSheet = forwardRef<
  DoodleShareBottomSheetRef,
  Props
>(function DoodleShareBottomSheet(
  { imageUri, onSaveToPhotos, onShare },
  ref,
) {
  const { t } = useTranslation();
  const renderBackdrop = useSheetBackdrop();

  const handleSaveToPhotos = useCallback(async () => {
    if (!imageUri) return;
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t("doodles.shareError"), t("palettes.permissionDenied"));
        return;
      }
      await MediaLibrary.saveToLibraryAsync(imageUri);
      Alert.alert(t("doodles.shareSuccess"));
      onSaveToPhotos?.();
    } catch {
      Alert.alert(t("doodles.shareError"), t("doodles.shareError"));
    }
  }, [imageUri, t, onSaveToPhotos]);

  // Native share sheet: OS shows WhatsApp, Mail, Messages, etc. No per-app code.
  const handleShare = useCallback(async () => {
    if (!imageUri) return;
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert(t("doodles.shareError"), t("doodles.shareError"));
        return;
      }
      await Sharing.shareAsync(imageUri, { mimeType: "image/png" });
      onShare?.();
    } catch {
      Alert.alert(t("doodles.shareError"), t("doodles.shareError"));
    }
  }, [imageUri, t, onShare]);

  const options = [
    {
      key: "download" as const,
      label: t("doodles.shareDownload"),
      icon: "square.and.arrow.down" as const,
      onPress: handleSaveToPhotos,
    },
    {
      key: "share" as const,
      label: t("doodles.shareViaSystem"),
      icon: "square.and.arrow.up" as const,
      onPress: handleShare,
    },
  ];

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
        <ThemedText type="label" style={styles.title}>
          {t("doodles.shareTitle")}
        </ThemedText>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={styles.optionRow}
            onPress={opt.onPress}
            activeOpacity={0.7}
          >
            <IconSymbol
              name={opt.icon}
              size={24}
              color={Accent.primary}
            />
            <ThemedText style={styles.optionLabel}>
              {opt.label}
            </ThemedText>
            <IconSymbol
              name="chevron.right"
              size={20}
              color={Accent.onSurfaceMuted}
            />
          </TouchableOpacity>
        ))}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },
  title: {
    marginBottom: Spacing.md,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Surface.high,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  optionLabel: {
    flex: 1,
    fontSize: Typography.fontSize.md,
  },
});
