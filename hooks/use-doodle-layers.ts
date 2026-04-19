import { useCallback, useEffect, useState } from "react";
import { useSharedValue } from "react-native-reanimated";

import type { TransformShared } from "@/components/doodle-transform-layer";
import type { Doodle } from "@/types";

const DEFAULT_SKETCH_OPACITY = 0.85;
const DEFAULT_WALL_OPACITY = 1;

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

export type DoodleLayersReturn = {
  wall: TransformShared;
  sketch: TransformShared;
  wallOpacityAmount: number;
  setWallOpacityAmount: (v: number) => void;
  sketchOpacityAmount: number;
  setSketchOpacityAmount: (v: number) => void;
  /** Reset the active tab's layer to its default transform values. */
  resetTransform: (activeTab: "wall" | "sketch") => void;
  /** Serialized snapshot suitable for persisting in the store. */
  serializeTransforms: () => { wall: LayerTransformData; sketch: LayerTransformData };
};

/**
 * Manages the SharedValue trees for wall and sketch doodle layers.
 * Automatically restores persisted transforms when `doodleId` is provided.
 */
export function useDoodleLayers(
  doodleId: string | undefined,
  getDoodle: (id: string) => Doodle | undefined,
): DoodleLayersReturn {
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

  const [wallOpacityAmount, setWallOpacityAmount] = useState(DEFAULT_WALL_OPACITY);
  const [sketchOpacityAmount, setSketchOpacityAmount] = useState(DEFAULT_SKETCH_OPACITY);

  // Restore persisted transform when editing an existing doodle
  useEffect(() => {
    if (!doodleId) return;
    const doodle = getDoodle(doodleId);
    const raw = doodle?.transformData as { wall?: unknown; sketch?: unknown } | undefined;
    if (!raw?.wall || !raw?.sketch) return;
    if (!isLayerTransformData(raw.wall) || !isLayerTransformData(raw.sketch)) return;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doodleId]);

  const resetTransform = useCallback(
    (activeTab: "wall" | "sketch") => {
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
    },
    // SharedValues are stable refs — no need to list them
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const serializeTransforms = useCallback(
    () => ({
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
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const wall: TransformShared = {
    offsetX: wallOffsetX,
    offsetY: wallOffsetY,
    savedOffsetX: wallSavedOffsetX,
    savedOffsetY: wallSavedOffsetY,
    scale: wallScale,
    savedScale: wallSavedScale,
    rotation: wallRotation,
    savedRotation: wallSavedRotation,
    flipX: wallFlipX,
    flipY: wallFlipY,
    opacity: wallOpacity,
  };

  const sketch: TransformShared = {
    offsetX: sketchOffsetX,
    offsetY: sketchOffsetY,
    savedOffsetX: sketchSavedOffsetX,
    savedOffsetY: sketchSavedOffsetY,
    scale: sketchScale,
    savedScale: sketchSavedScale,
    rotation: sketchRotation,
    savedRotation: sketchSavedRotation,
    flipX: sketchFlipX,
    flipY: sketchFlipY,
    opacity: sketchOpacity,
  };

  return {
    wall,
    sketch,
    wallOpacityAmount,
    setWallOpacityAmount,
    sketchOpacityAmount,
    setSketchOpacityAmount,
    resetTransform,
    serializeTransforms,
  };
}
