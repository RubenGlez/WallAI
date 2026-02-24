import { Stack } from "expo-router";

export default function ColorGridLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="[seriesId]" />
    </Stack>
  );
}
