import React from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";

import { Button, type ButtonProps } from "@/components/button";
import { LIST_FAB_SIZE } from "@/constants/list-layout";
import { Shadows } from "@/constants/theme";

export type FloatingActionButtonProps = Omit<ButtonProps, "size" | "fullWidth"> & {
  style?: StyleProp<ViewStyle>;
};

export function FloatingActionButton({
  style,
  ...props
}: FloatingActionButtonProps) {
  return (
    <Button
      {...props}
      size="icon"
      style={[styles.fab, style]}
    />
  );
}

const styles = StyleSheet.create({
  fab: {
    width: LIST_FAB_SIZE,
    height: LIST_FAB_SIZE,
    borderRadius: LIST_FAB_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.lg,
  },
});

