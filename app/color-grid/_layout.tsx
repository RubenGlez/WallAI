import { Stack } from "expo-router";

import { HeaderBackButton } from "@/components/header-back-button";

export default function ColorGridLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "",
        headerShadowVisible: false,
        headerLeft: () => <HeaderBackButton />,
      }}
    >
      <Stack.Screen name="[seriesId]" />
    </Stack>
  );
}
