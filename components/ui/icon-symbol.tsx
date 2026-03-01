// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'house': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'paintbrush.fill': 'palette',
  'paintbrush': 'palette',
  'swatchpalette': 'palette',
  'camera.fill': 'camera',
  'camera': 'camera',
  'square.stack.3d.up.fill': 'layers',
  'square.stack.3d.up': 'layers',
  'folder.fill': 'folder',
  'folder': 'folder',
  'line.3.horizontal.decrease.circle.fill': 'tune',
  'xmark.circle.fill': 'cancel',
  'checkmark.circle.fill': 'check-circle',
  'circle': 'radio-button-unchecked',
  'circle.lefthalf.filled': 'opacity',
  'square.grid.2x2': 'apps',
  'square.grid.2x2.fill': 'apps',
  'magnifyingglass': 'search',
  'plus.circle.fill': 'add-circle',
  'plus': 'add',
  'list.bullet': 'list',
  'trash': 'delete',
  'trash.fill': 'delete',
  'photo.on.rectangle.angled': 'photo-library',
  'wand.and.stars': 'auto-fix-high',
  'pencil.and.outline': 'edit',
  'photo.fill': 'photo-camera',
  'eye': 'visibility',
  'eye.fill': 'visibility',
  'swatchpalette.fill': 'palette',
  'paintpalette': 'palette',
  'paintpalette.fill': 'palette',
  'person': 'person',
  'person.fill': 'person',
  'star': 'star-outline',
  'star.fill': 'star',
  'chevron.left': 'arrow-back',
  'checkmark.square.fill': 'check-box',
  'square': 'check-box-outline-blank',
  'arrow.left.and.right': 'flip',
  'square.and.arrow.down': 'save',
  'square.and.arrow.up': 'share',
  'arrow.clockwise': 'restart-alt',
  'photo.fill.on.rectangle.fill': 'wallpaper',
  'message': 'chat',
} as IconMapping;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: keyof typeof MAPPING;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
