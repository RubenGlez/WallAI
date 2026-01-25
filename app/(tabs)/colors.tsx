import { ColorDetailModal } from "@/components/color-detail-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCartStore } from "@/stores/useCartStore";
import { useColorsStore } from "@/stores/useColorsStore";
import { ColorWithTranslations } from "@/types";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");
const NUM_COLUMNS = 3;
const GAP = Spacing.sm;
const ITEM_SIZE =
  (width - Spacing.md * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

interface ColorItemProps {
  color: ColorWithTranslations;
  onPress: () => void;
}

function ColorItem({ color, onPress }: ColorItemProps) {
  const { isInCart } = useCartStore();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const inCart = isInCart(color.id);

  return (
    <TouchableOpacity
      style={[
        styles.colorItem,
        {
          width: ITEM_SIZE,
          height: ITEM_SIZE,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.colorSwatch,
          { backgroundColor: color.hex },
          inCart && styles.colorSwatchInCart,
        ]}
      >
        {inCart && (
          <View style={styles.cartBadge}>
            <ThemedText style={styles.cartBadgeText}>✓</ThemedText>
          </View>
        )}
      </View>
      <View style={styles.colorInfo}>
        <ThemedText style={styles.colorCode} numberOfLines={1}>
          {color.code}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

export default function ColorsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const { colorsWithTranslations, isLoading, loadColors } = useColorsStore();
  const [selectedColor, setSelectedColor] =
    useState<ColorWithTranslations | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (colorsWithTranslations.length === 0) {
      loadColors();
    }
  }, []);

  const handleColorPress = (color: ColorWithTranslations) => {
    setSelectedColor(color);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedColor(null);
  };

  if (isLoading && colorsWithTranslations.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.tint} />
          <ThemedText style={styles.loadingText}>Loading colors...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Colors
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {colorsWithTranslations.length} colors available
        </ThemedText>
      </View>

      <FlatList
        data={colorsWithTranslations}
        renderItem={({ item }) => (
          <ColorItem color={item} onPress={() => handleColorPress(item)} />
        )}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>No colors found</ThemedText>
          </View>
        }
      />

      <ColorDetailModal
        visible={modalVisible}
        color={selectedColor}
        onClose={handleCloseModal}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    opacity: 0.7,
  },
  listContent: {
    padding: Spacing.md,
    paddingTop: Spacing.sm,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: GAP,
  },
  colorItem: {
    marginBottom: GAP,
  },
  colorSwatch: {
    width: "100%",
    height: ITEM_SIZE - 30,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
    position: "relative",
    overflow: "hidden",
  },
  colorSwatchInCart: {
    borderWidth: 2,
    borderColor: Colors.light.success,
  },
  cartBadge: {
    position: "absolute",
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: Colors.light.success,
    borderRadius: BorderRadius.full,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  colorInfo: {
    paddingHorizontal: Spacing.xs,
  },
  colorCode: {
    fontSize: Typography.fontSize.xs,
    opacity: 0.8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: Spacing.md,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    opacity: 0.7,
  },
});
