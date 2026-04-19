import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/themed-text";
import { Accent, BorderRadius, FontFamily, Spacing, Surface, Typography } from "@/constants/theme";

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

const SIZE_CONFIG = {
  sm: { vertical: 8, horizontal: Spacing.md, fontSize: Typography.fontSize.sm },
  md: { vertical: 10, horizontal: Spacing.md + 4, fontSize: Typography.fontSize.md },
  lg: { vertical: 13, horizontal: Spacing.lg, fontSize: Typography.fontSize.md },
  icon: { vertical: Spacing.sm, horizontal: Spacing.sm, fontSize: Typography.fontSize.md },
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
  const isDisabled = disabled || loading;
  const cfg = SIZE_CONFIG[size];
  const isIconOnly = size === "icon" || (!children && icon);

  const baseContainerStyle: ViewStyle = {
    flexDirection: iconPosition === "right" ? "row-reverse" : "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.full,
    paddingVertical: cfg.vertical,
    paddingHorizontal: isIconOnly ? cfg.vertical : cfg.horizontal,
    minHeight: Spacing.touchTarget,
    gap: children && icon ? Spacing.sm : 0,
    ...(isIconOnly ? { width: Spacing.touchTarget } : {}),
    ...(fullWidth ? { alignSelf: "stretch" } : {}),
  };

  const textColor =
    variant === "primary" ? Accent.onPrimary :
    variant === "destructive" ? Accent.error :
    Accent.primary;

  const inner = loading ? (
    <ActivityIndicator size="small" color={textColor} />
  ) : (
    <>
      {icon != null && <View style={styles.iconWrap}>{icon}</View>}
      {children != null && (
        <ThemedText
          style={{
            color: textColor,
            fontSize: cfg.fontSize,
            fontFamily: FontFamily.displaySemiBold,
          }}
          numberOfLines={1}
        >
          {children}
        </ThemedText>
      )}
    </>
  );

  if (variant === "primary") {
    if (isDisabled) {
      return (
        <TouchableOpacity
          disabled
          style={[
            baseContainerStyle,
            { backgroundColor: Surface.highest },
            fullWidth ? { alignSelf: "stretch" } : {},
            style,
          ]}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Accent.onSurfaceMuted} />
          ) : (
            <>
              {icon != null && <View style={styles.iconWrap}>{icon}</View>}
              {children != null && (
                <ThemedText
                  style={{
                    color: Accent.onSurfaceMuted,
                    fontSize: cfg.fontSize,
                    fontFamily: FontFamily.displaySemiBold,
                  }}
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
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={false}
        style={[
          { borderRadius: BorderRadius.full, overflow: "hidden" },
          fullWidth ? { alignSelf: "stretch" } : {},
          style,
        ]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[Accent.primary, Accent.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={baseContainerStyle}
        >
          {inner}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyle: ViewStyle =
    variant === "secondary"
      ? { backgroundColor: Surface.high }
      : variant === "outline"
      ? { backgroundColor: "transparent", borderWidth: 1, borderColor: `${Accent.outlineVariant}40` }
      : variant === "destructive"
      ? { backgroundColor: "transparent", borderWidth: 1, borderColor: `${Accent.error}60` }
      : { backgroundColor: "transparent" };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        baseContainerStyle,
        variantStyle,
        isDisabled && { opacity: 0.35 },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      activeOpacity={0.7}
    >
      {inner}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});
