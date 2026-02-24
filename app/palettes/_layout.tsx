import { Stack } from "expo-router";

export default function PalettesRootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="create" />
      <Stack.Screen name="import" />
    </Stack>
  );
}

