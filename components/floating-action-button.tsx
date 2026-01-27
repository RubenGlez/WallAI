import React from "react";
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export interface FloatingActionButtonItem {
  icon: string;
  onPress: () => void;
  size?: "small" | "large";
  backgroundColor?: string;
  iconColor?: string;
  borderColor?: string;
}

interface FloatingActionButtonProps {
  items: FloatingActionButtonItem[];
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  containerStyle?: ViewStyle;
}

export function FloatingActionButton({
  items,
  position = "bottom-right",
  containerStyle,
}: FloatingActionButtonProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const getPositionStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    };

    switch (position) {
      case "bottom-right":
        return { ...baseStyle, bottom: Spacing.lg, right: Spacing.lg };
      case "bottom-left":
        return { ...baseStyle, bottom: Spacing.lg, left: Spacing.lg };
      case "top-right":
        return { ...baseStyle, top: Spacing.lg, right: Spacing.lg };
      case "top-left":
        return { ...baseStyle, top: Spacing.lg, left: Spacing.lg };
      default:
        return { ...baseStyle, bottom: Spacing.lg, right: Spacing.lg };
    }
  };

  const getButtonSize = (size: "small" | "large" = "large") => {
    return size === "large" ? 56 : 36;
  };

  const getIconSize = (size: "small" | "large" = "large") => {
    return size === "large" ? 28 : 18;
  };

  const getShadowStyle = (size: "small" | "large" = "large") => {
    if (size === "large") {
      return {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
      };
    }
    return {
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      elevation: 3,
    };
  };

  // Sort items: large first, then small
  const sortedItems = [...items].sort((a, b) => {
    const aSize = a.size ?? "large";
    const bSize = b.size ?? "large";
    if (aSize === "large" && bSize === "small") return -1;
    if (aSize === "small" && bSize === "large") return 1;
    return 0;
  });

  const primaryButton = sortedItems.find((item) => (item.size ?? "large") === "large") ?? sortedItems[0];
  const secondaryButtons = sortedItems.filter((item) => (item.size ?? "large") === "small");

  return (
    <View style={[getPositionStyle(), containerStyle]}>
      {/* Primary button (large) */}
      {primaryButton && (
        <TouchableOpacity
          style={[
            styles.floatingButton,
            {
              width: getButtonSize(primaryButton.size),
              height: getButtonSize(primaryButton.size),
              backgroundColor: primaryButton.backgroundColor ?? theme.tint,
              ...getShadowStyle(primaryButton.size),
            },
          ]}
          activeOpacity={0.85}
          onPress={primaryButton.onPress}
        >
          <IconSymbol
            name={primaryButton.icon}
            size={getIconSize(primaryButton.size)}
            color={primaryButton.iconColor ?? theme.background}
          />
        </TouchableOpacity>
      )}

      {/* Secondary buttons (small) - positioned above primary */}
      {secondaryButtons.map((item, index) => {
        if (!primaryButton) {
          // If no primary button, just render small buttons stacked
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.floatingButton,
                {
                  width: getButtonSize(item.size),
                  height: getButtonSize(item.size),
                  backgroundColor: item.backgroundColor ?? theme.backgroundSecondary,
                  borderWidth: item.borderColor ? 1 : 0,
                  borderColor: item.borderColor ?? theme.border,
                  marginBottom: index < secondaryButtons.length - 1 ? Spacing.sm : 0,
                  ...getShadowStyle(item.size),
                },
              ]}
              activeOpacity={0.85}
              onPress={item.onPress}
            >
              <IconSymbol
                name={item.icon}
                size={getIconSize(item.size)}
                color={item.iconColor ?? theme.text}
              />
            </TouchableOpacity>
          );
        }

        const primarySize = getButtonSize(primaryButton.size);
        const secondarySize = getButtonSize(item.size);
        const spacing = 16;
        const offset = (primarySize - secondarySize) / 2;

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.floatingButton,
              styles.floatingButtonSmall,
              {
                width: secondarySize,
                height: secondarySize,
                backgroundColor: item.backgroundColor ?? theme.backgroundSecondary,
                borderWidth: item.borderColor ? 1 : 0,
                borderColor: item.borderColor ?? theme.border,
                top: -(primarySize + spacing - offset),
                right: offset,
                ...getShadowStyle(item.size),
              },
            ]}
            activeOpacity={0.85}
            onPress={item.onPress}
          >
            <IconSymbol
              name={item.icon}
              size={getIconSize(item.size)}
              color={item.iconColor ?? theme.text}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  floatingButtonSmall: {
    position: "absolute",
  },
});
