import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

import { HeaderBackButton } from "@/components/header-back-button";

export default function DoodlesLayout() {
  const { t } = useTranslation();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
