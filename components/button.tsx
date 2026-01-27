import React from "react";
import { StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/themed-text";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface ButtonProps {
  onPress: () => void;
  label?: string;
  icon?: string;
  iconPosition?: "left" | "right";
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  backgroundColor?: string;
  textColor?: string;
  iconColor?: string;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  activeOpacity?: number;
}

export function Button({
  onPress,
  label,
  icon,
  iconPosition = "left",
  variant = "primary",
  size = "medium",
  backgroundColor,
  textColor,
  iconColor,
  disabled = false,
  style,
  textStyle,
  activeOpacity = 0.85,
}: ButtonProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.md,
          fontSize: Typography.fontSize.sm,
          iconSize: 16,
        };
      case "large":
        return {
          paddingVertical: Spacing.lg,
          paddingHorizontal: Spacing.xl,
          fontSize: Typography.fontSize.lg,
          iconSize: 24,
        };
      default:
        return {
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.lg,
          fontSize: Typography.fontSize.md,
          iconSize: 20,
        };
    }
  };

  const getVariantStyles = () => {
    const sizeStyles = getSizeStyles();
    const baseStyle: ViewStyle = {
      paddingVertical: sizeStyles.paddingVertical,
      paddingHorizontal: sizeStyles.paddingHorizontal,
      borderRadius: BorderRadius.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.sm,
    };

    switch (variant) {
      case "primary":
        return {
          ...baseStyle,
          backgroundColor: backgroundColor ?? theme.tint,
          ...(size === "large" && {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }),
        };
      case "secondary":
        return {
          ...baseStyle,
          backgroundColor: backgroundColor ?? theme.backgroundSecondary,
          borderWidth: 1,
          borderColor: theme.border,
        };
      case "outline":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: backgroundColor ?? theme.tint,
        };
      case "ghost":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
        };
      default:
        return baseStyle;
    }
  };

  const getTextColor = () => {
    if (textColor) return textColor;
    if (variant === "primary") return theme.background;
    if (variant === "outline") return backgroundColor ?? theme.tint;
    return theme.text;
  };

  const getIconColorValue = () => {
    if (iconColor) return iconColor;
    return getTextColor();
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity
      style={[variantStyles, style, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={activeOpacity}
    >
      {icon && iconPosition === "left" && (
        <IconSymbol
          name={icon}
          size={sizeStyles.iconSize}
          color={getIconColorValue()}
        />
      )}
      {label && (
        <ThemedText
          style={[
            {
              fontSize: sizeStyles.fontSize,
              fontWeight: Typography.fontWeight.semibold,
              color: getTextColor(),
            },
            textStyle,
          ]}
        >
          {label}
        </ThemedText>
      )}
      {icon && iconPosition === "right" && (
        <IconSymbol
          name={icon}
          size={sizeStyles.iconSize}
          color={getIconColorValue()}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
});
