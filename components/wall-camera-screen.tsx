/**
 * Camera-dependent wall screen content.
 * Loaded dynamically from wall.tsx so expo-camera is only required when this screen is used.
 * Avoids "Cannot find native module 'ExpoCamera'" when running on web or without a dev build.
 */
import { SketchOverlay } from "@/components/sketch-overlay";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { useProjectsStore, type OverlayConfig } from "@/stores/useProjectsStore";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";

const defaultOverlayConfig: OverlayConfig = {
  opacity: 0.7,
  scale: 1,
  rotation: 0,
  position: { x: 0, y: 0 },
};

export function WallCameraScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [cameraLayout, setCameraLayout] = useState({ width: 0, height: 0 });

  const activeProject = useProjectsStore((s) => s.getActiveProject());
  const createProject = useProjectsStore((s) => s.createProject);
  const setProjectSketch = useProjectsStore((s) => s.setProjectSketch);
  const setActiveProject = useProjectsStore((s) => s.setActiveProject);
  const updateOverlayConfig = useProjectsStore((s) => s.updateOverlayConfig);
  const setProjectWallImage = useProjectsStore((s) => s.setProjectWallImage);

  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const cameraRef = React.useRef<CameraView>(null);

  const sketchUri = activeProject?.sketchImageUri ?? null;
  const overlayConfig = activeProject?.overlayConfig ?? defaultOverlayConfig;

  const handleCameraLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setCameraLayout({ width, height });
  }, []);

  const handleOverlayConfigChange = useCallback(
    (config: OverlayConfig) => {
      if (activeProject?.id) {
        updateOverlayConfig(activeProject.id, config);
      }
    },
    [activeProject?.id, updateOverlayConfig]
  );

  const handleOpacityChange = useCallback(
    (value: number) => {
      if (activeProject?.id) {
        updateOverlayConfig(activeProject.id, { opacity: value });
      }
    },
    [activeProject?.id, updateOverlayConfig]
  );

  const pickSketch = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.9,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;
    let projectId = activeProject?.id;
    if (!projectId) {
      projectId = createProject(t("wall.defaultProjectName"));
      setActiveProject(projectId);
    }
    setProjectSketch(projectId, uri);
  }, [activeProject?.id, createProject, setActiveProject, setProjectSketch, t]);

  const takePhoto = useCallback(async () => {
    if (!cameraRef.current || !cameraReady || !activeProject?.id) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false,
      });
      if (photo?.uri) {
        setProjectWallImage(activeProject.id, photo.uri);
      }
    } catch (e) {
      console.warn("Take picture error", e);
    }
  }, [activeProject?.id, cameraReady, setProjectWallImage]);

  if (!permission) {
    return (
      <ThemedView style={styles.center} safeArea>
        <ThemedText>{t("wall.loadingPermissions")}</ThemedText>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.center} safeArea>
        <ThemedText style={styles.permissionText}>
          {t("wall.cameraPermissionMessage")}
        </ThemedText>
        <TouchableOpacity
          style={[styles.permissionButton, { backgroundColor: theme.tint }]}
          onPress={requestPermission}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.permissionButtonText}>
            {t("wall.grantPermission")}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (!sketchUri) {
    return (
      <ThemedView style={styles.container} safeArea>
        <View style={styles.noSketchContent}>
          <IconSymbol
            name="photo.on.rectangle.angled"
            size={56}
            color={theme.textSecondary}
          />
          <ThemedText type="title" style={styles.noSketchTitle}>
            {t("wall.noSketchTitle")}
          </ThemedText>
          <ThemedText style={styles.noSketchSubtitle}>
            {t("wall.noSketchSubtitle")}
          </ThemedText>
          <TouchableOpacity
            style={[styles.pickSketchButton, { backgroundColor: theme.tint }]}
            onPress={pickSketch}
            activeOpacity={0.8}
          >
            <IconSymbol name="photo.fill" size={20} color={theme.background} />
            <ThemedText style={styles.pickSketchButtonText}>
              {t("wall.pickSketch")}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        onLayout={handleCameraLayout}
        onCameraReady={() => setCameraReady(true)}
      />
      {cameraLayout.width > 0 && cameraLayout.height > 0 && (
        <SketchOverlay
          sketchUri={sketchUri}
          config={overlayConfig}
          containerWidth={cameraLayout.width}
          containerHeight={cameraLayout.height}
          onConfigChange={handleOverlayConfigChange}
        />
      )}

      <View
        style={[
          styles.controls,
          { backgroundColor: theme.background, paddingBottom: Spacing.xxl + insets.bottom },
        ]}
      >
        <View style={styles.opacityRow}>
          <IconSymbol
            name="circle.lefthalf.filled"
            size={20}
            color={theme.text}
          />
          <Slider
            style={styles.slider}
            minimumValue={0.1}
            maximumValue={1}
            value={overlayConfig.opacity}
            onValueChange={handleOpacityChange}
            minimumTrackTintColor={theme.tint}
            maximumTrackTintColor={theme.border}
            thumbTintColor={theme.tint}
          />
        </View>
        <TouchableOpacity
          style={[styles.captureButton, { backgroundColor: theme.background }]}
          onPress={takePhoto}
          activeOpacity={0.8}
        >
          <View style={[styles.captureButtonInner, { borderColor: theme.text }]} />
        </TouchableOpacity>
      </View>

      <View style={[styles.hint, { top: Spacing.lg + insets.top }]}>
        <ThemedText style={styles.hintText}>{t("wall.gestureHint")}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  cameraContainer: {
    flex: 1,
    ...(Platform.OS === "android" && { minHeight: 400 }),
  },
  permissionText: {
    textAlign: "center",
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  permissionButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  permissionButtonText: {
    color: "#FFFFFF",
    fontWeight: Typography.fontWeight.semibold,
  },
  noSketchContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  noSketchTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  noSketchSubtitle: {
    textAlign: "center",
    opacity: 0.8,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  pickSketchButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
  },
  pickSketchButtonText: {
    color: "#FFFFFF",
    fontWeight: Typography.fontWeight.semibold,
  },
  controls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    alignItems: "center",
  },
  opacityRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    maxWidth: 280,
    marginBottom: Spacing.sm,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 4,
  },
  hint: {
    position: "absolute",
    left: Spacing.md,
    right: Spacing.md,
    alignItems: "center",
  },
  hintText: {
    fontSize: Typography.fontSize.xs,
    opacity: 0.9,
  },
});
