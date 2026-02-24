import { Stack } from "expo-router";

export default function DoodlesRootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="create" />
    </Stack>
  );
}

