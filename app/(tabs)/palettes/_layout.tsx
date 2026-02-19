import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useNavigation } from 'expo-router';
import { TouchableOpacity } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

function HeaderBackButton() {
  const navigation = useNavigation();
  const tint = useThemeColor({}, 'tint');
  return (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={{ paddingLeft: Spacing.md, paddingRight: Spacing.sm, paddingVertical: Spacing.sm }}
      accessibilityRole="button"
      accessibilityLabel="Volver"
    >
      <MaterialIcons name="arrow-back" size={24} color={tint} />
    </TouchableOpacity>
  );
}

export default function PalettesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="create"
        options={{
          headerShown: true,
          headerBackTitle: '',
          headerShadowVisible: false,
          headerLeft: () => <HeaderBackButton />,
        }}
      />
    </Stack>
  );
}
