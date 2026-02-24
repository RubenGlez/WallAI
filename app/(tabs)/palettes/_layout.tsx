import { Stack } from 'expo-router';

import { HeaderBackButton } from '@/components/header-back-button';

export default function PalettesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
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
