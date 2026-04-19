import { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import React, { useCallback } from "react";

/**
 * Returns a stable `renderBackdrop` callback for BottomSheetModal.
 * Standard config: appears at index 0, disappears at -1, 50% opacity.
 */
export function useSheetBackdrop() {
  return useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
      />
    ),
    [],
  );
}
