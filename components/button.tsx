import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

const SIZE_PADDING = {
  sm: { vertical: Spacing.xs, horizontal: Spacing.sm },
  md: { vertical: Spacing.sm, horizontal: Spacing.md },
  lg: { vertical: Spacing.md, horizontal: Spacing.lg },
  icon: { vertical: Spacing.sm, horizontal: Spacing.sm },
} as const;

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  disabled = false,
  loading = false,
  fullWidth,
  onPress,
  accessibilityLabel,
  style,
  children,
}: ButtonProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const isDisabled = disabled || loading;

  const padding = SIZE_PADDING[size];

  const variantStyles: ViewStyle = (() => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: theme.tint,
          borderWidth: 0,
        };
      case "secondary":
        return {
          backgroundColor: theme.backgroundSecondary,
          borderWidth: 1,
          borderColor: theme.border,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: theme.border,
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          borderWidth: 0,
        };
      case "destructive":
        return {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: theme.error,
        };
      default:
        return {};
    }
  })();

  const textColor =
    variant === "primary"
      ? theme.background
      : variant === "destructive"
        ? theme.error
        : theme.text;

  const fontSize =
    size === "sm"
      ? Typography.fontSize.sm
      : size === "lg"
        ? Typography.fontSize.md
        : Typography.fontSize.md;

  const containerStyle: ViewStyle = {
    flexDirection: iconPosition === "right" ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: padding.vertical,
    paddingHorizontal: padding.horizontal,
    borderRadius: BorderRadius.md,
    minHeight: size === "icon" ? Spacing.touchTarget : undefined,
    opacity: isDisabled ? 0.5 : 1,
    gap: children && icon ? Spacing.sm : 0,
    ...(fullWidth ? { alignSelf: "stretch" } : {}),
    ...(size === "icon" ? { width: Spacing.touchTarget, paddingHorizontal: 0 } : {}),
    ...variantStyles,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[containerStyle, style]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {icon != null && <View style={styles.iconWrap}>{icon}</View>}
          {children != null && (
            <ThemedText
          style={[
            styles.label,
            {
              color: textColor,
              fontSize,
              fontWeight:
                variant === "primary" || variant === "secondary"
                  ? Typography.fontWeight.semibold
                  : Typography.fontWeight.medium,
            },
          ]}
          numberOfLines={1}
        >
          {children}
        </ThemedText>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {},
});
