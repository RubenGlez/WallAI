import React from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/button";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol, type IconSymbolName } from "@/components/ui/icon-symbol";
import { Accent, BorderRadius, Spacing, Surface, Typography } from "@/constants/theme";

type Props = {
  icon: IconSymbolName;
  label: string;
  onTakePhoto: () => void;
  onPickGallery: () => void;
  loading: boolean;
};

/**
 * Empty-state slot shown before an image is chosen for a doodle layer.
 * Provides camera and gallery picker actions.
 */
export function DoodlePlaceholderSlot({
  icon,
  label,
  onTakePhoto,
  onPickGallery,
  loading,
}: Props) {
  const { t } = useTranslation();

  return (
    <View style={[styles.wrap, { backgroundColor: Surface.high }]}>
      <IconSymbol name={icon} size={48} color={Accent.onSurfaceMuted} />
      <ThemedText style={[styles.label, { color: Accent.onSurfaceMuted }]}>
        {label}
      </ThemedText>
      <View style={styles.buttons}>
        <Button
          variant="secondary"
          size="md"
          icon={<IconSymbol name="camera.fill" size={24} color={Accent.primary} />}
          style={styles.btn}
          onPress={onTakePhoto}
          disabled={loading}
          loading={loading}
          accessibilityLabel={t("doodles.takePhoto")}
        >
          {t("doodles.takePhoto")}
        </Button>
        <Button
          variant="secondary"
          size="md"
          icon={
            <IconSymbol
              name="photo.on.rectangle.angled"
              size={24}
              color={Accent.primary}
            />
          }
          style={styles.btn}
          onPress={onPickGallery}
          disabled={loading}
          accessibilityLabel={t("doodles.pickFromGallery")}
        >
          {t("doodles.pickFromGallery")}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  buttons: {
    gap: Spacing.md,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 48,
  },
});
