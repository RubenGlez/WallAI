import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack, useNavigation } from 'expo-router';
import { useTranslation } from 'react-i18next';
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

export default function DoodlesLayout() {
  const { t } = useTranslation();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="create"
        options={{
          headerShown: true,
          title: t('doodles.createDoodle'),
          headerBackTitle: '',
          headerShadowVisible: false,
          headerLeft: () => <HeaderBackButton />,
        }}
      />
    </Stack>
  );
}
