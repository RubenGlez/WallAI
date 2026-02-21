import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Colors, Spacing, Typography } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

const TAB_BAR_HEIGHT = 48;

export type TabItem = {
  value: string;
  label: string;
  /** Optional static icon */
  icon?: React.ReactNode;
  /** Optional icon with selected state (use for dynamic color) */
  renderIcon?: (selected: boolean) => React.ReactNode;
};

export type TabsProps = {
  value: string;
  onChange: (value: string) => void;
  tabs: TabItem[];
};

export function Tabs({ value, onChange, tabs }: TabsProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.tabBar, { borderBottomColor: theme.border }]}>
      {tabs.map((tab) => {
        const isSelected = value === tab.value;
        return (
          <TouchableOpacity
            key={tab.value}
            style={[
              styles.tab,
              isSelected && {
                borderBottomColor: theme.tint,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => onChange(tab.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={tab.label}
          >
            {(tab.renderIcon != null || tab.icon != null) && (
              <View style={styles.tabIconWrap}>
                {tab.renderIcon != null
                  ? tab.renderIcon(isSelected)
                  : tab.icon}
              </View>
            )}
            <ThemedText
              style={[
                styles.tabLabel,
                { color: isSelected ? theme.tint : theme.textSecondary },
              ]}
            >
              {tab.label}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    height: TAB_BAR_HEIGHT,
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  tabIconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
});
