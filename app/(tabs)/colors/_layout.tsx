import { Stack } from 'expo-router';

export default function ColorsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="series/[brandId]"
        options={{
          headerShown: true,
          headerBackTitle: '',
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="grid/[seriesId]"
        options={{
          headerShown: true,
          headerBackTitle: '',
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}
