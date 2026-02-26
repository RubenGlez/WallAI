import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { Button } from "@/components/button";
import { HeaderBackButton } from "@/components/header-back-button";
import { SaveNameModal } from "@/components/save-name-modal";
import { Screen } from "@/components/screen";
import { Tabs } from "@/components/tabs";
import { ThemedText } from "@/components/themed-text";
import { TransformToolbar } from "@/components/transform-toolbar";
import { IconSymbol, type IconSymbolName } from "@/components/ui/icon-symbol";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { useImagePicker } from "@/hooks/use-image-picker";
import { useTheme } from "@/hooks/use-theme";
import { useDoodlesStore } from "@/stores/useDoodlesStore";

const CONTENT_PADDING = Spacing.md;
const DEFAULT_SKETCH_OPACITY = 0.85;
const DEFAULT_WALL_OPACITY = 1;

type ImageSlot = "wall" | "sketch";
type TabId = "wall" | "sketch";

/** Shape we persist for each layer (wall/sketch) — must match handleConfirmSave */
type LayerTransformData = {
  offsetX: number;
  offsetY: number;
  scale: number;
  rotation: number;
  flipX: number;
  flipY: number;
  opacity: number;
};

function isLayerTransformData(v: unknown): v is LayerTransformData {
  return (
    typeof v === "object" &&
    v !== null &&
    "offsetX" in v &&
    "offsetY" in v &&
    "scale" in v &&
    "rotation" in v &&
    "flipX" in v &&
    "flipY" in v &&
    "opacity" in v
  );
}

export default function DoodlesCreateScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ doodleId?: string }>();
  const { theme } = useTheme();
  const router = useRouter();
  const getDoodle = useDoodlesStore((s) => s.getDoodle);
  const addDoodle = useDoodlesStore((s) => s.addDoodle);
  const updateDoodle = useDoodlesStore((s) => s.updateDoodle);
  const {
    pickFromGallery: pickFromGalleryFromHook,
    takePhoto: takePhotoFromHook,
    loading: pickerLoading,
  } = useImagePicker();

  const [activeTab, setActiveTab] = useState<TabId>("wall");
  const [wallUri, setWallUri] = useState<string | null>(null);
  const [sketchUri, setSketchUri] = useState<string | null>(null);
  const [loadingSlot, setLoadingSlot] = useState<ImageSlot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const doodleId = params.doodleId ?? undefined;

  useEffect(() => {
    if (!pickerLoading) setLoadingSlot(null);
  }, [pickerLoading]);

  useEffect(() => {
    if (doodleId) {
      const doodle = getDoodle(doodleId);
      if (doodle) {
        if (doodle.wallImageUri) setWallUri(doodle.wallImageUri);
        if (doodle.sketchImageUri) setSketchUri(doodle.sketchImageUri);
      }
    }
  }, [doodleId, getDoodle]);

  const headerTitle = useMemo(() => {
    if (!doodleId) return t("doodles.createDoodle");
    const doodle = getDoodle(doodleId);
    return doodle?.name?.trim() || t("doodles.defaultDoodleName");
  }, [doodleId, getDoodle, t]);

  const pickFromGallery = useCallback(
    (slot: ImageSlot) => {
      setError(null);
      setLoadingSlot(slot);
      if (slot === "wall") {
        pickFromGalleryFromHook((uri) => setWallUri(uri));
      } else {
        pickFromGalleryFromHook((uri) => setSketchUri(uri));
      }
    },
    [pickFromGalleryFromHook],
  );

  const takePhoto = useCallback(
    (slot: ImageSlot) => {
      setError(null);
      setLoadingSlot(slot);
      if (slot === "wall") {
        takePhotoFromHook((uri) => setWallUri(uri));
      } else {
        takePhotoFromHook((uri) => setSketchUri(uri));
      }
    },
    [takePhotoFromHook],
  );

  const bothLoaded = Boolean(wallUri && sketchUri);

  const wallOffsetX = useSharedValue(0);
  const wallOffsetY = useSharedValue(0);
  const wallSavedOffsetX = useSharedValue(0);
  const wallSavedOffsetY = useSharedValue(0);
  const wallScale = useSharedValue(1);
  const wallSavedScale = useSharedValue(1);
  const wallRotation = useSharedValue(0);
  const wallSavedRotation = useSharedValue(0);
  const wallFlipX = useSharedValue(1);
  const wallFlipY = useSharedValue(1);
  const wallOpacity = useSharedValue(DEFAULT_WALL_OPACITY);

  const sketchOffsetX = useSharedValue(0);
  const sketchOffsetY = useSharedValue(0);
  const sketchSavedOffsetX = useSharedValue(0);
  const sketchSavedOffsetY = useSharedValue(0);
  const sketchScale = useSharedValue(1);
  const sketchSavedScale = useSharedValue(1);
  const sketchRotation = useSharedValue(0);
  const sketchSavedRotation = useSharedValue(0);
  const sketchFlipX = useSharedValue(1);
  const sketchFlipY = useSharedValue(1);
  const sketchOpacity = useSharedValue(DEFAULT_SKETCH_OPACITY);

  const [wallOpacityAmount, setWallOpacityAmount] =
    useState(DEFAULT_WALL_OPACITY);
  const [sketchOpacityAmount, setSketchOpacityAmount] = useState(
    DEFAULT_SKETCH_OPACITY,
  );
  const [toolbarView, setToolbarView] = useState<"icons" | "opacity">("icons");
  const [showNameModal, setShowNameModal] = useState(false);
  const [doodleName, setDoodleName] = useState("");

  const resetTransform = useCallback(() => {
    if (activeTab === "wall") {
      wallOffsetX.value = 0;
      wallOffsetY.value = 0;
      wallSavedOffsetX.value = 0;
      wallSavedOffsetY.value = 0;
      wallScale.value = 1;
      wallSavedScale.value = 1;
      wallRotation.value = 0;
      wallSavedRotation.value = 0;
      wallFlipX.value = 1;
      wallFlipY.value = 1;
      wallOpacity.value = DEFAULT_WALL_OPACITY;
      setWallOpacityAmount(DEFAULT_WALL_OPACITY);
    } else {
      sketchOffsetX.value = 0;
      sketchOffsetY.value = 0;
      sketchSavedOffsetX.value = 0;
      sketchSavedOffsetY.value = 0;
      sketchScale.value = 1;
      sketchSavedScale.value = 1;
      sketchRotation.value = 0;
      sketchSavedRotation.value = 0;
      sketchFlipX.value = 1;
      sketchFlipY.value = 1;
      sketchOpacity.value = DEFAULT_SKETCH_OPACITY;
      setSketchOpacityAmount(DEFAULT_SKETCH_OPACITY);
    }
  }, [
    activeTab,
    wallOffsetX,
    wallOffsetY,
    wallSavedOffsetX,
    wallSavedOffsetY,
    wallScale,
    wallSavedScale,
    wallRotation,
    wallSavedRotation,
    wallFlipX,
    wallFlipY,
    wallOpacity,
    sketchOffsetX,
    sketchOffsetY,
    sketchSavedOffsetX,
    sketchSavedOffsetY,
    sketchScale,
    sketchSavedScale,
    sketchRotation,
    sketchSavedRotation,
    sketchFlipX,
    sketchFlipY,
    sketchOpacity,
  ]);

  // Restore saved transform when editing an existing doodle
  useEffect(() => {
    if (!doodleId) return;
    const doodle = getDoodle(doodleId);
    const raw = doodle?.transformData as
      | { wall?: unknown; sketch?: unknown }
      | undefined;
    if (!raw?.wall || !raw?.sketch) return;
    if (!isLayerTransformData(raw.wall) || !isLayerTransformData(raw.sketch))
      return;

    const w = raw.wall;
    wallOffsetX.value = w.offsetX;
    wallOffsetY.value = w.offsetY;
    wallSavedOffsetX.value = w.offsetX;
    wallSavedOffsetY.value = w.offsetY;
    wallScale.value = w.scale;
    wallSavedScale.value = w.scale;
    wallRotation.value = w.rotation;
    wallSavedRotation.value = w.rotation;
    wallFlipX.value = w.flipX;
    wallFlipY.value = w.flipY;
    wallOpacity.value = w.opacity;
    setWallOpacityAmount(w.opacity);

    const s = raw.sketch;
    sketchOffsetX.value = s.offsetX;
    sketchOffsetY.value = s.offsetY;
    sketchSavedOffsetX.value = s.offsetX;
    sketchSavedOffsetY.value = s.offsetY;
    sketchScale.value = s.scale;
    sketchSavedScale.value = s.scale;
    sketchRotation.value = s.rotation;
    sketchSavedRotation.value = s.rotation;
    sketchFlipX.value = s.flipX;
    sketchFlipY.value = s.flipY;
    sketchOpacity.value = s.opacity;
    setSketchOpacityAmount(s.opacity);
  }, [
    doodleId,
    getDoodle,
    wallOffsetX,
    wallOffsetY,
    wallSavedOffsetX,
    wallSavedOffsetY,
    wallScale,
    wallSavedScale,
    wallRotation,
    wallSavedRotation,
    wallFlipX,
    wallFlipY,
    wallOpacity,
    sketchOffsetX,
    sketchOffsetY,
    sketchSavedOffsetX,
    sketchSavedOffsetY,
    sketchScale,
    sketchSavedScale,
    sketchRotation,
    sketchSavedRotation,
    sketchFlipX,
    sketchFlipY,
    sketchOpacity,
  ]);

  const openSaveModal = useCallback(() => {
    if (!wallUri || !sketchUri) return;
    setDoodleName(doodleId ? (getDoodle(doodleId)?.name ?? "") : "");
    setShowNameModal(true);
  }, [wallUri, sketchUri, doodleId, getDoodle]);

  const handleConfirmSave = useCallback(() => {
    if (!wallUri || !sketchUri) return;
    const name = doodleName.trim() || t("doodles.defaultDoodleName");
    const transformData = {
      wall: {
        offsetX: wallOffsetX.value,
        offsetY: wallOffsetY.value,
        scale: wallScale.value,
        rotation: wallRotation.value,
        flipX: wallFlipX.value,
        flipY: wallFlipY.value,
        opacity: wallOpacity.value,
      },
      sketch: {
        offsetX: sketchOffsetX.value,
        offsetY: sketchOffsetY.value,
        scale: sketchScale.value,
        rotation: sketchRotation.value,
        flipX: sketchFlipX.value,
        flipY: sketchFlipY.value,
        opacity: sketchOpacity.value,
      },
    };
    if (doodleId) {
      updateDoodle(doodleId, {
        name,
        wallImageUri: wallUri,
        sketchImageUri: sketchUri,
        transformData,
      });
    } else {
      addDoodle({
        name,
        wallImageUri: wallUri,
        sketchImageUri: sketchUri,
        transformData,
      });
    }
    setShowNameModal(false);
    setDoodleName("");
    router.back();
  }, [
    wallUri,
    sketchUri,
    doodleId,
    doodleName,
    t,
    addDoodle,
    updateDoodle,
    router,
    wallOffsetX,
    wallOffsetY,
    wallScale,
    wallRotation,
    wallFlipX,
    wallFlipY,
    wallOpacity,
    sketchOffsetX,
    sketchOffsetY,
    sketchScale,
    sketchRotation,
    sketchFlipX,
    sketchFlipY,
    sketchOpacity,
  ]);

  const contentArea = (() => {
    if (bothLoaded) {
      return (
        <View style={styles.superpositionWrap}>
          <TransformableLayer
            imageUri={wallUri!}
            offsetX={wallOffsetX}
            offsetY={wallOffsetY}
            savedOffsetX={wallSavedOffsetX}
            savedOffsetY={wallSavedOffsetY}
            scale={wallScale}
            savedScale={wallSavedScale}
            rotation={wallRotation}
            savedRotation={wallSavedRotation}
            flipX={wallFlipX}
            flipY={wallFlipY}
            opacity={wallOpacity}
            isActive={activeTab === "wall"}
          />
          <TransformableLayer
            imageUri={sketchUri!}
            offsetX={sketchOffsetX}
            offsetY={sketchOffsetY}
            savedOffsetX={sketchSavedOffsetX}
            savedOffsetY={sketchSavedOffsetY}
            scale={sketchScale}
            savedScale={sketchSavedScale}
            rotation={sketchRotation}
            savedRotation={sketchSavedRotation}
            flipX={sketchFlipX}
            flipY={sketchFlipY}
            opacity={sketchOpacity}
            isActive={activeTab === "sketch"}
          />
        </View>
      );
    }

    if (activeTab === "wall") {
      if (!wallUri) {
        return (
          <PlaceholderSlot
            icon="photo.fill.on.rectangle.fill"
            label={t("doodles.wallImage")}
            onTakePhoto={() => takePhoto("wall")}
            onPickGallery={() => pickFromGallery("wall")}
            loading={loadingSlot === "wall"}
            theme={theme}
            t={t}
          />
        );
      }
      return (
        <View style={styles.singleImageWrap}>
          <Image
            source={{ uri: wallUri }}
            style={styles.singleImage}
            resizeMode="contain"
          />
          <Button
            variant="outline"
            size="sm"
            style={[
              styles.replaceBtn,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            onPress={() => setWallUri(null)}
          >
            {t("doodles.replaceImage")}
          </Button>
        </View>
      );
    }

    if (activeTab === "sketch") {
      if (!sketchUri) {
        return (
          <PlaceholderSlot
            icon="paintbrush"
            label={t("doodles.sketchImage")}
            onTakePhoto={() => takePhoto("sketch")}
            onPickGallery={() => pickFromGallery("sketch")}
            loading={loadingSlot === "sketch"}
            theme={theme}
            t={t}
          />
        );
      }
      return (
        <View style={styles.singleImageWrap}>
          <Image
            source={{ uri: sketchUri }}
            style={styles.singleImage}
            resizeMode="contain"
          />
          <Button
            variant="outline"
            size="sm"
            style={[
              styles.replaceBtn,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            onPress={() => setSketchUri(null)}
          >
            {t("doodles.replaceImage")}
          </Button>
        </View>
      );
    }

    return null;
  })();

  const isWallActive = activeTab === "wall";
  const activeFlipX = isWallActive ? wallFlipX : sketchFlipX;
  const activeFlipY = isWallActive ? wallFlipY : sketchFlipY;
  const activeOpacity = isWallActive ? wallOpacity : sketchOpacity;
  const activeOpacityAmount = isWallActive
    ? wallOpacityAmount
    : sketchOpacityAmount;
  const setActiveOpacityAmount = isWallActive
    ? setWallOpacityAmount
    : setSketchOpacityAmount;

  return (
    <Screen safeBottom>
      <View style={styles.header}>
        <HeaderBackButton title={headerTitle} />
      </View>
      <Tabs
        value={activeTab}
        onChange={(v) => setActiveTab(v as TabId)}
        tabs={[
          {
            value: "wall",
            label: t("doodles.tabWall"),
            renderIcon: (selected) => (
              <IconSymbol
                name="photo.fill.on.rectangle.fill"
                size={20}
                color={selected ? theme.tint : theme.textSecondary}
              />
            ),
          },
          {
            value: "sketch",
            label: t("doodles.tabSketch"),
            renderIcon: (selected) => (
              <IconSymbol
                name="paintbrush"
                size={20}
                color={selected ? theme.tint : theme.textSecondary}
              />
            ),
          },
        ]}
      />

      <View style={styles.content}>
        {bothLoaded ? (
          <View style={styles.contentWithOverlay}>
            {contentArea}
            <TransformToolbar
              view={toolbarView}
              onViewChange={setToolbarView}
              onSave={openSaveModal}
              onReset={resetTransform}
              onFlipH={() => {
                activeFlipX.value = -activeFlipX.value;
              }}
              onFlipV={() => {
                activeFlipY.value = -activeFlipY.value;
              }}
              opacityValue={activeOpacityAmount}
              onOpacityChange={(v) => {
                setActiveOpacityAmount(v);
                activeOpacity.value = v;
              }}
              bottom={Spacing.sm}
              labels={{
                save: t("doodles.toolbarSave"),
                reset: t("doodles.toolbarReset"),
                flipH: t("doodles.toolbarFlipH"),
                flipV: t("doodles.toolbarFlipV"),
                opacity: t("doodles.toolbarOpacity"),
                back: t("doodles.toolbarBack"),
              }}
            />
          </View>
        ) : (
          contentArea
        )}
      </View>

      {error ? (
        <View style={styles.errorWrap}>
          <ThemedText style={[styles.error, { color: theme.error }]}>
            {error}
          </ThemedText>
        </View>
      ) : null}

      <SaveNameModal
        visible={showNameModal}
        onRequestClose={() => setShowNameModal(false)}
        title={t("doodles.nameYourDoodle")}
        placeholder={t("doodles.doodleNamePlaceholder")}
        value={doodleName}
        onChangeText={setDoodleName}
        onCancel={() => setShowNameModal(false)}
        onConfirm={handleConfirmSave}
        cancelLabel={t("common.cancel")}
        saveLabel={t("common.save")}
      />
    </Screen>
  );
}

type TransformShared = {
  offsetX: SharedValue<number>;
  offsetY: SharedValue<number>;
  savedOffsetX: SharedValue<number>;
  savedOffsetY: SharedValue<number>;
  scale: SharedValue<number>;
  savedScale: SharedValue<number>;
  rotation: SharedValue<number>;
  savedRotation: SharedValue<number>;
  flipX: SharedValue<number>;
  flipY: SharedValue<number>;
  opacity: SharedValue<number>;
};

function TransformableLayer({
  imageUri,
  offsetX,
  offsetY,
  savedOffsetX,
  savedOffsetY,
  scale,
  savedScale,
  rotation,
  savedRotation,
  flipX,
  flipY,
  opacity,
  isActive,
}: { imageUri: string; isActive: boolean } & TransformShared) {
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate((e) => {
          offsetX.value = savedOffsetX.value + e.translationX;
          offsetY.value = savedOffsetY.value + e.translationY;
        })
        .onEnd(() => {
          savedOffsetX.value = offsetX.value;
          savedOffsetY.value = offsetY.value;
        }),
    [offsetX, offsetY, savedOffsetX, savedOffsetY],
  );

  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .onChange((e) => {
          scale.value = scale.value * e.scaleChange;
        })
        .onEnd(() => {
          savedScale.value = scale.value;
        }),
    [scale, savedScale],
  );

  const rotationGesture = useMemo(
    () =>
      Gesture.Rotation()
        .onChange((e) => {
          rotation.value = rotation.value + e.rotationChange;
        })
        .onEnd(() => {
          savedRotation.value = rotation.value;
        }),
    [rotation, savedRotation],
  );

  const composed = useMemo(
    () => Gesture.Simultaneous(panGesture, pinchGesture, rotationGesture),
    [panGesture, pinchGesture, rotationGesture],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    width: "100%",
    height: "100%",
    opacity: opacity.value,
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
      { scale: scale.value },
      { scaleX: flipX.value },
      { scaleY: flipY.value },
      { rotate: `${rotation.value}rad` },
    ],
  }));

  const content = (
    <Animated.View
      style={[styles.superpositionLayer, animatedStyle]}
      pointerEvents={isActive ? "box-none" : "none"}
    >
      <Image
        source={{ uri: imageUri }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="contain"
      />
    </Animated.View>
  );

  if (isActive) {
    return <GestureDetector gesture={composed}>{content}</GestureDetector>;
  }
  return content;
}

function PlaceholderSlot({
  icon,
  label,
  onTakePhoto,
  onPickGallery,
  loading,
  theme,
  t,
}: {
  icon: IconSymbolName;
  label: string;
  onTakePhoto: () => void;
  onPickGallery: () => void;
  loading: boolean;
  theme: (typeof Colors)["light"];
  t: (key: string) => string;
}) {
  return (
    <View
      style={[
        styles.placeholderWrap,
        { backgroundColor: theme.backgroundSecondary },
      ]}
    >
      <IconSymbol name={icon} size={48} color={theme.textSecondary} />
      <ThemedText
        style={[styles.placeholderLabel, { color: theme.textSecondary }]}
      >
        {label}
      </ThemedText>
      <View style={styles.placeholderButtons}>
        <Button
          variant="secondary"
          size="md"
          icon={<IconSymbol name="camera.fill" size={24} color={theme.tint} />}
          style={[
            styles.placeholderBtn,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
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
              color={theme.tint}
            />
          }
          style={[
            styles.placeholderBtn,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
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
  content: {
    flex: 1,
    padding: CONTENT_PADDING,
    minHeight: 0,
  },
  placeholderWrap: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  placeholderLabel: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  placeholderButtons: {
    gap: Spacing.md,
  },
  placeholderBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minHeight: 48,
  },
  singleImageWrap: {
    flex: 1,
    position: "relative",
  },
  singleImage: {
    width: "100%",
    height: "100%",
    borderRadius: BorderRadius.md,
  },
  replaceBtn: {
    position: "absolute",
    bottom: Spacing.md,
    alignSelf: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  superpositionWrap: {
    flex: 1,
    position: "relative",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  superpositionLayer: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  sketchLayer: {
    opacity: 0.85,
  },
  errorWrap: {
    padding: Spacing.md,
  },
  error: {
    fontSize: Typography.fontSize.sm,
  },
  contentWithOverlay: {
    flex: 1,
    position: "relative",
  },
  header: {
    paddingHorizontal: Spacing.md,
  },
});
