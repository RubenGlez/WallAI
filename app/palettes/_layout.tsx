import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

import { HeaderBackButton } from "@/components/header-back-button";

export default function PalettesRootLayout() {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen
        name="create"
        options={{
          headerShown: true,
          title: t("palettes.exploreColorsTitle"),
          headerBackTitle: "",
          headerShadowVisible: false,
          headerLeft: () => <HeaderBackButton />,
        }}
      />
      <Stack.Screen
        name="import"
        options={{
          headerShown: true,
          title: t("palettes.importFromImage"),
          headerBackTitle: "",
          headerShadowVisible: false,
          headerLeft: () => <HeaderBackButton />,
        }}
      />
    </Stack>
  );
}

