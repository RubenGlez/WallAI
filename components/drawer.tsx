import React from "react";
import { StyleSheet, ViewStyle, TouchableOpacity, View } from "react-native";
import { Drawer as RNDrawer } from "react-native-drawer-layout";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface DrawerProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  drawerContent: React.ReactNode;
  drawerPosition?: "left" | "right";
  drawerStyle?: ViewStyle;
  showCloseButton?: boolean;
}

export function Drawer({
  open,
  onOpen,
  onClose,
  title,
  children,
  drawerContent,
  drawerPosition = "right",
  drawerStyle,
  showCloseButton = true,
}: DrawerProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <RNDrawer
      open={open}
      onOpen={onOpen}
      onClose={onClose}
      drawerPosition={drawerPosition}
      drawerStyle={[styles.drawerStyle, drawerStyle]}
      renderDrawerContent={() => {
        return (
          <ThemedView style={styles.drawer} safeArea="top">
            {title && (
              <View
                style={[styles.header, { borderBottomColor: theme.border }]}
              >
                <ThemedText type="title" style={styles.headerTitle}>
                  {title}
                </ThemedText>
                {showCloseButton && (
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeIconButton}
                  >
                    <IconSymbol
                      name="xmark.circle.fill"
                      size={24}
                      color={theme.text}
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}
            {drawerContent}
          </ThemedView>
        );
      }}
    >
      {children}
    </RNDrawer>
  );
}

const styles = StyleSheet.create({
  drawer: {
    flex: 1,
    width: "100%",
  },
  drawerStyle: {
    width: "85%",
    maxWidth: 400,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
  },
  closeIconButton: {
    padding: Spacing.xs,
  },
});
