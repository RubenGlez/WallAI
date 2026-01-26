import { View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  safeArea?: boolean | 'top' | 'bottom' | 'horizontal';
};

export function ThemedView({ 
  style, 
  lightColor, 
  darkColor, 
  safeArea = false,
  ...otherProps 
}: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');
  const insets = useSafeAreaInsets();

  let safeAreaStyle = {};
  if (safeArea) {
    if (safeArea === true) {
      // Apply all safe areas
      safeAreaStyle = {
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      };
    } else if (safeArea === 'top') {
      safeAreaStyle = { paddingTop: insets.top };
    } else if (safeArea === 'bottom') {
      safeAreaStyle = { paddingBottom: insets.bottom };
    } else if (safeArea === 'horizontal') {
      safeAreaStyle = {
        paddingLeft: insets.left,
        paddingRight: insets.right,
      };
    }
  }

  return <View style={[{ backgroundColor }, safeAreaStyle, style]} {...otherProps} />;
}
