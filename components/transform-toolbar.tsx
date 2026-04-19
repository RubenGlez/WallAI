import Slider from "@react-native-community/slider";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Accent, BorderRadius, Glass, Shadows, Spacing, Surface } from "@/constants/theme";

const TOOLBAR_ICON_SIZE = 40;
const TOOLBAR_GAP = Spacing.sm;
const TOOLBAR_PILL_PADDING_H = Spacing.sm;
const TOOLBAR_PILL_WIDTH =
  2 * TOOLBAR_PILL_PADDING_H + 5 * TOOLBAR_ICON_SIZE + 4 * TOOLBAR_GAP;

export type TransformToolbarView = "icons" | "opacity";

export type TransformToolbarProps = {
  view: TransformToolbarView;
  onViewChange: (view: TransformToolbarView) => void;
  onSave: () => void;
  onReset: () => void;
  onFlipH: () => void;
  onFlipV: () => void;
  opacityValue: number;
  onOpacityChange: (value: number) => void;
  /** Bottom offset for the floating toolbar (e.g. Spacing.sm) */
  bottom?: number;
  labels: {
    save: string;
    reset: string;
    flipH: string;
    flipV: string;
    opacity: string;
    back: string;
  };
};

export function TransformToolbar({
  view,
  onViewChange,
  onSave,
  onReset,
  onFlipH,
  onFlipV,
  opacityValue,
  onOpacityChange,
  bottom = Spacing.sm,
  labels,
}: TransformToolbarProps) {
  return (
    <View
      style={[styles.floatingWrap, { bottom }]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.pill,
          {
            width: TOOLBAR_PILL_WIDTH,
            backgroundColor: `${Glass.backgroundColor}99`,
          },
        ]}
      >
        {view === "icons" ? (
          <>
            <TouchableOpacity
              style={[styles.toolbarBtn, { backgroundColor: Accent.primary }]}
              onPress={onSave}
              accessibilityRole="button"
              accessibilityLabel={labels.save}
            >
              <IconSymbol
                name="square.and.arrow.down"
                size={22}
                color={Accent.onPrimary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toolbarBtn, { backgroundColor: Surface.highest }]}
              onPress={onReset}
              accessibilityRole="button"
              accessibilityLabel={labels.reset}
            >
              <IconSymbol name="arrow.clockwise" size={22} color={Accent.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toolbarBtn, { backgroundColor: Surface.highest }]}
              onPress={onFlipH}
              accessibilityRole="button"
              accessibilityLabel={labels.flipH}
            >
              <IconSymbol name="arrow.left.and.right" size={22} color={Accent.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toolbarBtn, { backgroundColor: Surface.highest }]}
              onPress={onFlipV}
              accessibilityRole="button"
              accessibilityLabel={labels.flipV}
            >
              <IconSymbol
                name="arrow.left.and.right"
                size={22}
                color={Accent.primary}
                style={{ transform: [{ rotate: "90deg" }] }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toolbarBtn, { backgroundColor: Surface.highest }]}
              onPress={() => onViewChange("opacity")}
              accessibilityRole="button"
              accessibilityLabel={labels.opacity}
            >
              <IconSymbol name="circle.lefthalf.filled" size={22} color={Accent.primary} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.toolbarBtn, { backgroundColor: Surface.highest }]}
              onPress={() => onViewChange("icons")}
              accessibilityRole="button"
              accessibilityLabel={labels.back}
            >
              <IconSymbol name="chevron.left" size={22} color={Accent.primary} />
            </TouchableOpacity>
            <View style={styles.opacityRow}>
              <IconSymbol
                name="circle.lefthalf.filled"
                size={20}
                color={Accent.onSurfaceMuted}
              />
              <Slider
                style={styles.slider}
                minimumValue={0.1}
                maximumValue={1}
                value={opacityValue}
                onValueChange={onOpacityChange}
                minimumTrackTintColor={Accent.primary}
                maximumTrackTintColor={Accent.outlineVariant}
                thumbTintColor={Accent.primary}
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: TOOLBAR_PILL_PADDING_H,
    borderRadius: BorderRadius.full,
    gap: TOOLBAR_GAP,
    ...Shadows.md,
  },
  toolbarBtn: {
    width: TOOLBAR_ICON_SIZE,
    height: TOOLBAR_ICON_SIZE,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  opacityRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    minWidth: 0,
  },
  slider: {
    flex: 1,
    height: 24,
    minWidth: 60,
  },
});
