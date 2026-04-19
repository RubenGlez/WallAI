import React, { useCallback } from "react";
import { FlatList, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLOR_GRID } from "@/constants/color-grid";
import type { Color } from "@/types";

const { NUM_COLUMNS, GAP } = COLOR_GRID;

type Props = {
  colors: Color[];
  /** Render the card inside each cell. Receives the color and its absolute index. */
  renderCard: (color: Color, index: number) => React.ReactNode;
  ListHeaderComponent?: React.ReactElement | null;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Extra bottom padding added on top of safe area inset. Defaults to 0. */
  extraBottomPadding?: number;
};

/**
 * Shared color grid FlatList. Handles column count, row gaps, and cell widths
 * consistently across catalog, color-grid, and palette-create screens.
 */
export function ColorGridList({
  colors,
  renderCard,
  ListHeaderComponent,
  contentContainerStyle,
  extraBottomPadding = 0,
}: Props) {
  const insets = useSafeAreaInsets();

  const renderItem = useCallback(
    ({ item, index }: { item: Color; index: number }) => (
      <View
        style={{
          width: COLOR_GRID.CARD_WIDTH,
          marginRight: index % NUM_COLUMNS === NUM_COLUMNS - 1 ? 0 : GAP,
        }}
      >
        {renderCard(item, index)}
      </View>
    ),
    [renderCard],
  );

  return (
    <FlatList
      data={colors}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      numColumns={NUM_COLUMNS}
      columnWrapperStyle={styles.row}
      contentContainerStyle={[
        { paddingBottom: insets.bottom + extraBottomPadding },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeaderComponent}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: GAP,
  },
});
