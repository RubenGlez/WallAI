import { useMemo } from "react";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function useTheme() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = useMemo(() => Colors[colorScheme], [colorScheme]);
  return { colorScheme, theme, isDark: colorScheme === "dark" };
}
