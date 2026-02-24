import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

import { HeaderBackButton } from "@/components/header-back-button";

export default function DoodlesRootLayout() {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen
        name="create"
        options={{
          headerShown: true,
          title: t("doodles.createDoodle"),
          headerBackTitle: "",
          headerShadowVisible: false,
          headerLeft: () => <HeaderBackButton />,
        }}
      />
    </Stack>
  );
}

