import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  StyleSheet,
  View,
} from "react-native";
import { captureRef } from "react-native-view-shot";

import { Button } from "@/components/button";
import {
  DoodleShareBottomSheet,
  type DoodleShareBottomSheetRef,
} from "@/components/doodle-share-bottom-sheet";
import { DoodlePlaceholderSlot } from "@/components/doodle-placeholder-slot";
import { DoodlePreviewModal } from "@/components/doodle-preview-modal";
import { TransformableLayer } from "@/components/doodle-transform-layer";
import { HeaderBackButton } from "@/components/header-back-button";
import { SaveNameModal } from "@/components/save-name-modal";
import { Screen } from "@/components/screen";
import { Tabs } from "@/components/tabs";
import { ThemedText } from "@/components/themed-text";
import { TransformToolbar } from "@/components/transform-toolbar";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Accent, BorderRadius, Spacing, Surface, Typography } from "@/constants/theme";
import { useImagePicker } from "@/hooks/use-image-picker";
import { useDoodleLayers } from "@/hooks/use-doodle-layers";
import { confirmDelete } from "@/lib/confirm-delete";
import { useDoodlesStore } from "@/stores/useDoodlesStore";

const CONTENT_PADDING = Spacing.md;

type ImageSlot = "wall" | "sketch";
type TabId = "wall" | "sketch";

export default function DoodlesCreateScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ doodleId?: string }>();
  const router = useRouter();
  const getDoodle = useDoodlesStore((s) => s.getDoodle);
  const addDoodle = useDoodlesStore((s) => s.addDoodle);
  const updateDoodle = useDoodlesStore((s) => s.updateDoodle);
  const removeDoodle = useDoodlesStore((s) => s.removeDoodle);
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
  const [sharedImageUri, setSharedImageUri] = useState<string | null>(null);
  const [toolbarView, setToolbarView] = useState<"icons" | "opacity">("icons");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [doodleName, setDoodleName] = useState("");
  const [pendingThumbnailUri, setPendingThumbnailUri] = useState<string | null>(null);

  const doodleId = params.doodleId ?? undefined;
  const montageRef = useRef<View>(null);
  const shareSheetRef = useRef<DoodleShareBottomSheetRef>(null);

  const {
    wall,
    sketch,
    wallOpacityAmount,
    setWallOpacityAmount,
    sketchOpacityAmount,
    setSketchOpacityAmount,
    resetTransform,
    serializeTransforms,
  } = useDoodleLayers(doodleId, getDoodle);

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

  const openSaveModal = useCallback(() => {
    if (!wallUri || !sketchUri) return;
    setDoodleName(doodleId ? (getDoodle(doodleId)?.name ?? "") : "");
    if (montageRef.current) {
      captureRef(montageRef, { result: "tmpfile", format: "png", quality: 0.8 })
        .then((uri) => setPendingThumbnailUri(uri))
        .catch(() => setPendingThumbnailUri(null));
    }
    setShowNameModal(true);
  }, [wallUri, sketchUri, doodleId, getDoodle]);

  const handleSharePress = useCallback(() => {
    if (!bothLoaded || !montageRef.current) return;
    captureRef(montageRef, { result: "tmpfile", format: "png", quality: 1 })
      .then((uri) => {
        setSharedImageUri(uri);
        shareSheetRef.current?.present();
      })
      .catch(() => setError(t("doodles.shareError")));
  }, [bothLoaded, t]);

  const handleDeleteDoodle = useCallback(() => {
    if (!doodleId) return;
    confirmDelete({
      title: t("doodles.deleteDoodleTitle"),
      message: t("doodles.deleteDoodleMessage"),
      confirmLabel: t("common.delete"),
      cancelLabel: t("common.cancel"),
      onConfirm: () => {
        removeDoodle(doodleId);
        router.back();
      },
    });
  }, [doodleId, t, removeDoodle, router]);

  const handleConfirmSave = useCallback(() => {
    if (!wallUri || !sketchUri) return;
    const name = doodleName.trim() || t("doodles.defaultDoodleName");
    const transformData = serializeTransforms();
    const thumbnailUri = pendingThumbnailUri ?? undefined;
    if (doodleId) {
      updateDoodle(doodleId, {
        name,
        wallImageUri: wallUri,
        sketchImageUri: sketchUri,
        transformData,
        ...(thumbnailUri && { thumbnailUri }),
      });
    } else {
      addDoodle({
        name,
        wallImageUri: wallUri,
        sketchImageUri: sketchUri,
        transformData,
        ...(thumbnailUri && { thumbnailUri }),
      });
    }
    setShowNameModal(false);
    setDoodleName("");
    setPendingThumbnailUri(null);
    router.back();
  }, [wallUri, sketchUri, doodleId, doodleName, pendingThumbnailUri, t, addDoodle, updateDoodle, router, serializeTransforms]);

  const isWallActive = activeTab === "wall";
  const activeLayer = isWallActive ? wall : sketch;
  const activeOpacityAmount = isWallActive ? wallOpacityAmount : sketchOpacityAmount;
  const setActiveOpacityAmount = isWallActive ? setWallOpacityAmount : setSketchOpacityAmount;

  const contentArea = (() => {
    if (bothLoaded) {
      return (
        <View ref={montageRef} style={styles.superpositionWrap} collapsable={false}>
          <TransformableLayer imageUri={wallUri!} {...wall} isActive={activeTab === "wall"} />
          <TransformableLayer imageUri={sketchUri!} {...sketch} isActive={activeTab === "sketch"} />
        </View>
      );
    }

    if (activeTab === "wall") {
      if (!wallUri) {
        return (
          <DoodlePlaceholderSlot
            icon="photo.fill.on.rectangle.fill"
            label={t("doodles.wallImage")}
            onTakePhoto={() => takePhoto("wall")}
            onPickGallery={() => pickFromGallery("wall")}
            loading={loadingSlot === "wall"}
          />
        );
      }
      return (
        <View style={styles.singleImageWrap}>
          <Image source={{ uri: wallUri }} style={styles.singleImage} resizeMode="contain" />
          <Button
            variant="outline"
            size="sm"
            style={[styles.replaceBtn, { backgroundColor: Surface.high }]}
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
          <DoodlePlaceholderSlot
            icon="paintbrush"
            label={t("doodles.sketchImage")}
            onTakePhoto={() => takePhoto("sketch")}
            onPickGallery={() => pickFromGallery("sketch")}
            loading={loadingSlot === "sketch"}
          />
        );
      }
      return (
        <View style={styles.singleImageWrap}>
          <Image source={{ uri: sketchUri }} style={styles.singleImage} resizeMode="contain" />
          <Button
            variant="outline"
            size="sm"
            style={[styles.replaceBtn, { backgroundColor: Surface.high }]}
            onPress={() => setSketchUri(null)}
          >
            {t("doodles.replaceImage")}
          </Button>
        </View>
      );
    }

    return null;
  })();

  return (
    <Screen safeBottom>
      <View style={styles.header}>
        <HeaderBackButton
          title={headerTitle}
          right={
            bothLoaded || doodleId ? (
              <View style={styles.headerRightRow}>
                {doodleId ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onPress={handleDeleteDoodle}
                    accessibilityLabel={t("doodles.deleteDoodle")}
                    icon={<IconSymbol name="trash" size={24} color={Accent.error} />}
                  />
                ) : null}
                {bothLoaded ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onPress={() => setIsPreviewMode(true)}
                      accessibilityLabel={t("doodles.previewDoodle")}
                      icon={<IconSymbol name="eye.fill" size={24} color={Accent.primary} />}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onPress={handleSharePress}
                      accessibilityLabel={t("doodles.shareDoodle")}
                      icon={<IconSymbol name="square.and.arrow.up" size={24} color={Accent.primary} />}
                    />
                  </>
                ) : null}
              </View>
            ) : null
          }
        />
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
                color={selected ? Accent.primary : Accent.onSurfaceMuted}
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
                color={selected ? Accent.primary : Accent.onSurfaceMuted}
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
              onReset={() => resetTransform(activeTab)}
              onFlipH={() => { activeLayer.flipX.value = -activeLayer.flipX.value; }}
              onFlipV={() => { activeLayer.flipY.value = -activeLayer.flipY.value; }}
              opacityValue={activeOpacityAmount}
              onOpacityChange={(v) => {
                setActiveOpacityAmount(v);
                activeLayer.opacity.value = v;
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
          <ThemedText style={[styles.error, { color: Accent.error }]}>{error}</ThemedText>
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

      <DoodleShareBottomSheet
        ref={shareSheetRef}
        imageUri={sharedImageUri}
        onSaveToPhotos={() => shareSheetRef.current?.dismiss()}
        onShare={() => shareSheetRef.current?.dismiss()}
      />

      {isPreviewMode && bothLoaded && (
        <DoodlePreviewModal
          wallUri={wallUri!}
          sketchUri={sketchUri!}
          wallTransform={wall}
          sketchTransform={sketch}
          onClose={() => setIsPreviewMode(false)}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: CONTENT_PADDING,
    minHeight: 0,
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
  },
  superpositionWrap: {
    flex: 1,
    position: "relative",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
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
  headerRightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
});
