import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Slider from "@react-native-community/slider";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { Colors, Shadows, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

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
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

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
            backgroundColor: theme.card,
            borderColor: theme.border,
            shadowColor: theme.text,
          },
        ]}
      >
        {view === "icons" ? (
          <>
            <TouchableOpacity
              style={[styles.toolbarBtn, { backgroundColor: theme.tint }]}
              onPress={onSave}
              accessibilityRole="button"
              accessibilityLabel={labels.save}
            >
              <MaterialIcons
                name="save"
                size={22}
                color={theme.background}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toolbarBtn,
                { backgroundColor: theme.backgroundSecondary },
              ]}
              onPress={onReset}
              accessibilityRole="button"
              accessibilityLabel={labels.reset}
            >
              <MaterialIcons
                name="restart-alt"
                size={22}
                color={theme.tint}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toolbarBtn,
                { backgroundColor: theme.backgroundSecondary },
              ]}
              onPress={onFlipH}
              accessibilityRole="button"
              accessibilityLabel={labels.flipH}
            >
              <MaterialIcons name="flip" size={22} color={theme.tint} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toolbarBtn,
                { backgroundColor: theme.backgroundSecondary },
              ]}
              onPress={onFlipV}
              accessibilityRole="button"
              accessibilityLabel={labels.flipV}
            >
              <MaterialIcons
                name="flip"
                size={22}
                color={theme.tint}
                style={{ transform: [{ rotate: "90deg" }] }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toolbarBtn,
                { backgroundColor: theme.backgroundSecondary },
              ]}
              onPress={() => onViewChange("opacity")}
              accessibilityRole="button"
              accessibilityLabel={labels.opacity}
            >
              <MaterialIcons
                name="opacity"
                size={22}
                color={theme.tint}
              />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[
                styles.toolbarBtn,
                { backgroundColor: theme.backgroundSecondary },
              ]}
              onPress={() => onViewChange("icons")}
              accessibilityRole="button"
              accessibilityLabel={labels.back}
            >
              <MaterialIcons
                name="arrow-back"
                size={22}
                color={theme.tint}
              />
            </TouchableOpacity>
            <View style={styles.opacityRow}>
              <MaterialIcons
                name="opacity"
                size={20}
                color={theme.textSecondary}
              />
              <Slider
                style={styles.slider}
                minimumValue={0.1}
                maximumValue={1}
                value={opacityValue}
                onValueChange={onOpacityChange}
                minimumTrackTintColor={theme.tint}
                maximumTrackTintColor={theme.border}
                thumbTintColor={theme.tint}
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
    borderRadius: 9999,
    borderWidth: 1,
    gap: TOOLBAR_GAP,
    ...Shadows.md,
  },
  toolbarBtn: {
    width: TOOLBAR_ICON_SIZE,
    height: TOOLBAR_ICON_SIZE,
    borderRadius: TOOLBAR_ICON_SIZE / 2,
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
