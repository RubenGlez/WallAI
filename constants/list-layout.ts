import { Dimensions } from "react-native";

import { Spacing } from "./theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const LIST_NUM_COLUMNS = 2;
export const LIST_GAP = Spacing.sm;
export const LIST_CARD_PADDING = Spacing.md;
export const LIST_FAB_SIZE = 56;
export const LIST_FAB_SIZE_SECONDARY = 48;

/**
 * Card width for a 2-column list with horizontal padding.
 */
export function getListCardWidth(): number {
  return (
    (SCREEN_WIDTH -
      LIST_CARD_PADDING * 2 -
      LIST_GAP * (LIST_NUM_COLUMNS - 1)) /
    LIST_NUM_COLUMNS
  );
}

/** Scroll content padding bottom when a single FAB is shown. */
export const SCROLL_PADDING_BOTTOM_WITH_FAB = Spacing.xxl + 80;

/** Scroll content padding bottom when a FAB group (e.g. 3 buttons) is shown. */
export const SCROLL_PADDING_BOTTOM_WITH_FAB_GROUP = Spacing.xxl + 120;
