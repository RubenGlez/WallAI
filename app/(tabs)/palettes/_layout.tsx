import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useNavigation } from 'expo-router';
import { TouchableOpacity } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

const HEADER_BUTTON = {
  minHeight: 44,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
};

function HeaderBackButton() {
  const navigation = useNavigation();
  const tint = useThemeColor({}, 'tint');
  return (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={[HEADER_BUTTON, { paddingRight: Spacing.sm }]}
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
      <Stack.Screen
        name="create/explore"
        options={{
          headerShown: true,
          headerBackTitle: '',
          headerShadowVisible: false,
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <Stack.Screen
        name="import"
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
