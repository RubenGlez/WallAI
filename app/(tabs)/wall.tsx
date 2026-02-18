/**
 * Wall tab: camera view with background and sketch layers.
 * Add or take a picture per layer; scale, move, and adjust transparency. Changes save automatically.
 */
import { ImageLayerOverlay } from "@/components/image-layer-overlay";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  useProjectsStore,
  type OverlayConfig,
} from "@/stores/useProjectsStore";
import type { LayerOverlayConfig } from "@/types";
import Slider from "@react-native-community/slider";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  LayoutChangeEvent,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const defaultOverlayConfig: OverlayConfig = {
  opacity: 0.7,
  scale: 1,
  rotation: 0,
  position: { x: 0, y: 0 },
};

type LayerType = "background" | "sketch";

export default function WallScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [cameraLayout, setCameraLayout] = useState({ width: 0, height: 0 });
  const [cameraReady, setCameraReady] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<LayerType>("background");
  const cameraRef = React.useRef<CameraView>(null);

  const activeProject = useProjectsStore((s) => s.getActiveProject());
  const createProject = useProjectsStore((s) => s.createProject);
  const setActiveProject = useProjectsStore((s) => s.setActiveProject);
  const setProjectSketch = useProjectsStore((s) => s.setProjectSketch);
  const clearProjectSketch = useProjectsStore((s) => s.clearProjectSketch);
  const setProjectBackground = useProjectsStore((s) => s.setProjectBackground);
  const clearProjectBackground = useProjectsStore(
    (s) => s.clearProjectBackground
  );
  const updateOverlayConfig = useProjectsStore((s) => s.updateOverlayConfig);
  const updateBackgroundOverlayConfig = useProjectsStore(
    (s) => s.updateBackgroundOverlayConfig
  );

  const [permission, requestPermission] = useCameraPermissions();

  const backgroundUri = activeProject?.backgroundImageUri ?? null;
  const sketchUri = activeProject?.sketchImageUri ?? null;
  const backgroundConfig: LayerOverlayConfig =
    activeProject?.backgroundOverlayConfig ?? defaultOverlayConfig;
  const sketchConfig = activeProject?.overlayConfig ?? defaultOverlayConfig;

  const selectedLayerUri =
    selectedLayer === "background" ? backgroundUri : sketchUri;
  const selectedLayerConfig =
    selectedLayer === "background" ? backgroundConfig : sketchConfig;

  const ensureProject = useCallback(() => {
    let projectId = activeProject?.id;
    if (!projectId) {
      projectId = createProject(t("wall.defaultProjectName"));
      setActiveProject(projectId);
    }
    return projectId;
  }, [activeProject?.id, createProject, setActiveProject, t]);

  const handleCameraLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setCameraLayout({ width, height });
  }, []);

  const handleBackgroundConfigChange = useCallback(
    (config: LayerOverlayConfig) => {
      if (activeProject?.id) {
        updateBackgroundOverlayConfig(activeProject.id, config);
      }
    },
    [activeProject?.id, updateBackgroundOverlayConfig]
  );

  const handleSketchConfigChange = useCallback(
    (config: LayerOverlayConfig) => {
      if (activeProject?.id) {
        updateOverlayConfig(activeProject.id, config);
      }
    },
    [activeProject?.id, updateOverlayConfig]
  );

  const pickImageForLayer = useCallback(
    async (layer: LayerType) => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.9,
        allowsEditing: false,
      });
      if (result.canceled || !result.assets[0]) return;
      const uri = result.assets[0].uri;
      const projectId = ensureProject();
      if (layer === "background") setProjectBackground(projectId, uri);
      else setProjectSketch(projectId, uri);
    },
    [ensureProject, setProjectBackground, setProjectSketch]
  );

  const takePhotoForLayer = useCallback(
    async (layer: LayerType) => {
      if (!cameraRef.current || !cameraReady) return;
      const projectId = ensureProject();
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.9,
          skipProcessing: false,
        });
        if (photo?.uri) {
          if (layer === "background")
            setProjectBackground(projectId, photo.uri);
          else setProjectSketch(projectId, photo.uri);
        }
      } catch (e) {
        console.warn("Take picture error", e);
      }
    },
    [cameraReady, ensureProject, setProjectBackground, setProjectSketch]
  );

  const removeLayer = useCallback(
    (layer: LayerType) => {
      if (!activeProject?.id) return;
      const isBackground = layer === "background";
      const title = isBackground
        ? t("wall.removeBackgroundTitle")
        : t("wall.removeSketchTitle");
      const message = isBackground
        ? t("wall.removeBackgroundMessage")
        : t("wall.removeSketchMessage");
      const confirmKey = isBackground
        ? "wall.removeBackgroundConfirm"
        : "wall.removeSketchConfirm";
      Alert.alert(title, message, [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t(confirmKey),
          style: "destructive",
          onPress: () => {
            if (isBackground) clearProjectBackground(activeProject.id);
            else clearProjectSketch(activeProject.id);
          },
        },
      ]);
    },
    [
      activeProject?.id,
      clearProjectBackground,
      clearProjectSketch,
      t,
    ]
  );

  const handleSelectedLayerOpacityChange = useCallback(
    (value: number) => {
      if (!activeProject?.id) return;
      if (selectedLayer === "background") {
        updateBackgroundOverlayConfig(activeProject.id, { opacity: value });
      } else {
        updateOverlayConfig(activeProject.id, { opacity: value });
      }
    },
    [
      activeProject?.id,
      selectedLayer,
      updateBackgroundOverlayConfig,
      updateOverlayConfig,
    ]
  );

  const saveAndNewWall = useCallback(() => {
    const newId = createProject(t("wall.defaultProjectName"));
    setActiveProject(newId);
    setSelectedLayer("background");
  }, [createProject, setActiveProject, t]);

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

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          onLayout={handleCameraLayout}
          onCameraReady={() => setCameraReady(true)}
        />
        {cameraLayout.width > 0 && cameraLayout.height > 0 && (
          <>
            {backgroundUri && (
              <ImageLayerOverlay
                imageUri={backgroundUri}
                config={backgroundConfig}
                containerWidth={cameraLayout.width}
                containerHeight={cameraLayout.height}
                onConfigChange={handleBackgroundConfigChange}
              />
            )}
            {sketchUri && (
              <ImageLayerOverlay
                imageUri={sketchUri}
                config={sketchConfig}
                containerWidth={cameraLayout.width}
                containerHeight={cameraLayout.height}
                onConfigChange={handleSketchConfigChange}
              />
            )}
          </>
        )}
      </View>

      <View
          style={[
            styles.controls,
            {
              backgroundColor: theme.background,
              paddingBottom: Spacing.sm + insets.bottom,
            },
          ]}
      >
        <View style={styles.layerSelector}>
          <TouchableOpacity
            style={[
              styles.layerSelectorButton,
              { backgroundColor: theme.backgroundSecondary },
              selectedLayer === "background" && { backgroundColor: theme.tint },
            ]}
            onPress={() => setSelectedLayer("background")}
            activeOpacity={0.8}
          >
            <ThemedText
              style={[
                styles.layerSelectorLabel,
                selectedLayer === "background" && styles.layerSelectorLabelActive,
                selectedLayer === "background" && { color: theme.background },
              ]}
            >
              {t("wall.layerBackground")}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.layerSelectorButton,
              { backgroundColor: theme.backgroundSecondary },
              selectedLayer === "sketch" && { backgroundColor: theme.tint },
            ]}
            onPress={() => setSelectedLayer("sketch")}
            activeOpacity={0.8}
          >
            <ThemedText
              style={[
                styles.layerSelectorLabel,
                selectedLayer === "sketch" && styles.layerSelectorLabelActive,
                selectedLayer === "sketch" && { color: theme.background },
              ]}
            >
              {t("wall.layerSketch")}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {selectedLayerUri ? (
          <>
            <View style={styles.toolbarRow}>
              <TouchableOpacity
                style={[
                  styles.toolbarButton,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
                onPress={() => removeLayer(selectedLayer)}
                activeOpacity={0.8}
              >
                <IconSymbol name="trash" size={18} color={theme.text} />
                <ThemedText style={styles.toolbarLabel} numberOfLines={1}>
                  {t("common.remove")}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toolbarButton,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
                onPress={() => pickImageForLayer(selectedLayer)}
                activeOpacity={0.8}
              >
                <IconSymbol
                  name="photo.on.rectangle.angled"
                  size={18}
                  color={theme.text}
                />
                <ThemedText style={styles.toolbarLabel} numberOfLines={1}>
                  {t("wall.pickImage")}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toolbarButton,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
                onPress={() => takePhotoForLayer(selectedLayer)}
                activeOpacity={0.8}
              >
                <IconSymbol name="camera.fill" size={18} color={theme.text} />
                <ThemedText style={styles.toolbarLabel} numberOfLines={1}>
                  {t("wall.takePhoto")}
                </ThemedText>
              </TouchableOpacity>
            </View>
            <View style={styles.opacityRow}>
              <IconSymbol
                name="circle.lefthalf.filled"
                size={18}
                color={theme.text}
              />
              <Slider
                style={styles.slider}
                minimumValue={0.1}
                maximumValue={1}
                value={selectedLayerConfig.opacity}
                onValueChange={handleSelectedLayerOpacityChange}
                minimumTrackTintColor={theme.tint}
                maximumTrackTintColor={theme.border}
                thumbTintColor={theme.tint}
              />
            </View>
          </>
        ) : (
          <TouchableOpacity
            style={[
              styles.addLayerInline,
              { backgroundColor: theme.backgroundSecondary },
            ]}
            onPress={() => pickImageForLayer(selectedLayer)}
            activeOpacity={0.8}
          >
            <IconSymbol name="plus.circle.fill" size={20} color={theme.tint} />
            <ThemedText style={styles.addLayerInlineText}>
              {selectedLayer === "background"
                ? t("wall.addBackground")
                : t("wall.addSketch")}
            </ThemedText>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.saveAndNewButton, { backgroundColor: theme.tint }]}
          onPress={saveAndNewWall}
          activeOpacity={0.8}
        >
          <IconSymbol name="plus.circle.fill" size={18} color={theme.background} />
          <ThemedText style={styles.saveAndNewButtonText}>
            {t("wall.saveAndNewWall")}
          </ThemedText>
        </TouchableOpacity>
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
  controls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    alignItems: "center",
  },
  layerSelector: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
    width: "100%",
    maxWidth: 280,
  },
  layerSelectorButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  layerSelectorLabel: {
    fontSize: Typography.fontSize.sm,
    opacity: 0.9,
  },
  layerSelectorLabelActive: {
    fontWeight: Typography.fontWeight.semibold,
  },
  toolbarRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xs,
    flexWrap: "wrap",
    marginBottom: Spacing.xs,
  },
  toolbarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    minWidth: 0,
  },
  toolbarLabel: {
    fontSize: Typography.fontSize.xs,
    maxWidth: 64,
  },
  addLayerInline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  addLayerInlineText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  opacityRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: Spacing.xs,
  },
  slider: {
    flex: 1,
    height: 36,
  },
  saveAndNewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  saveAndNewButtonText: {
    color: "#FFFFFF",
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
});
