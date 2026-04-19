import React, { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useKeepAwake } from "expo-keep-awake";

import { TransformableLayer, type TransformShared } from "@/components/doodle-transform-layer";
import { BorderRadius, Spacing, Surface } from "@/constants/theme";

type Props = {
  wallUri: string;
  sketchUri: string;
  wallTransform: TransformShared;
  sketchTransform: TransformShared;
  onClose: () => void;
};

/**
 * Full-screen preview modal showing the doodle composition without UI chrome.
 * Keeps the screen awake. Tap anywhere to show/hide the close button.
 */
export function DoodlePreviewModal({
  wallUri,
  sketchUri,
  wallTransform,
  sketchTransform,
  onClose,
}: Props) {
  useKeepAwake();
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  const resetTimer = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setShowControls(true);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [resetTimer]);

  return (
    <Modal
      visible
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.container} onPress={resetTimer}>
        <TransformableLayer imageUri={wallUri} {...wallTransform} isActive={false} />
        <TransformableLayer imageUri={sketchUri} {...sketchTransform} isActive={false} />
        {showControls && (
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityRole="button"
          >
            <View style={styles.closeBtnInner}>
              <Text style={styles.closeBtnText}>✕</Text>
            </View>
          </TouchableOpacity>
        )}
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Surface.lowest,
  },
  closeBtn: {
    position: "absolute",
    top: Spacing.xxl,
    right: Spacing.md,
  },
  closeBtnInner: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    lineHeight: 20,
    textAlign: "center",
  },
});
