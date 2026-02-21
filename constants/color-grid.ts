import { Dimensions } from "react-native";

import { Spacing } from "./theme";

const { width } = Dimensions.get("window");

export const COLOR_GRID = {
  NUM_COLUMNS: 3,
  GAP: Spacing.sm,
  HORIZONTAL_PADDING: Spacing.md,
  CARD_WIDTH:
    (width - Spacing.md * 2 - Spacing.sm * (3 - 1)) / 3,
  SWATCH_SIZE: (width - Spacing.md * 2 - Spacing.sm * (3 - 1)) / 3,
} as const;
