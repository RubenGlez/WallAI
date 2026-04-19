import React, { useRef } from "react";
import Swipeable from "react-native-gesture-handler/Swipeable";

import { SwipeableDeleteAction } from "@/components/swipeable-delete-action";

type Props = {
  children: React.ReactNode;
  onDelete: () => void;
};

/**
 * Wraps any list card with a swipe-to-delete gesture.
 * Manages the Swipeable ref internally; closes the row before calling onDelete.
 */
export function SwipeableRow({ children, onDelete }: Props) {
  const swipeRef = useRef<Swipeable>(null);

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={() => (
        <SwipeableDeleteAction
          onDelete={() => {
            swipeRef.current?.close();
            onDelete();
          }}
        />
      )}
      rightThreshold={60}
      overshootRight={false}
    >
      {children}
    </Swipeable>
  );
}
