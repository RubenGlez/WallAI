import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, StyleSheet } from "react-native";

type WallCameraScreenComponent = React.ComponentType;

export default function WallScreen() {
  const { t } = useTranslation();
  const [CameraScreen, setCameraScreen] =
    useState<WallCameraScreenComponent | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import("@/components/wall-camera-screen")
      .then((mod) => {
        if (!cancelled) {
          setCameraScreen(() => mod.WallCameraScreen);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loadError) {
    return (
      <ThemedView style={styles.center} safeArea>
        <ThemedText style={styles.errorTitle}>
          {t("wall.cameraUnavailableTitle")}
        </ThemedText>
        <ThemedText style={styles.errorMessage}>
          {t("wall.cameraUnavailableMessage")}
        </ThemedText>
      </ThemedView>
    );
  }

  if (!CameraScreen) {
    return (
      <ThemedView style={styles.center} safeArea>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText}>
          {t("wall.loadingPermissions")}
        </ThemedText>
      </ThemedView>
    );
  }

  return <CameraScreen />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  loadingText: {
    marginTop: Spacing.md,
  },
  errorTitle: {
    fontWeight: "600",
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  errorMessage: {
    textAlign: "center",
    opacity: 0.85,
  },
});
