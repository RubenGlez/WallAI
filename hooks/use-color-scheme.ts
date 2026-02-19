import { useColorScheme as useRNColorScheme } from 'react-native';

import { useThemeStore } from '@/stores/useThemeStore';

/**
 * Returns the effective color scheme: user override (from profile) or system.
 */
export function useColorScheme(): 'light' | 'dark' {
  const system = useRNColorScheme();
  const override = useThemeStore((s) => s.colorSchemeOverride);
  return override ?? system ?? 'light';
}
