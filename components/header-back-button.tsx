import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Spacing } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";

const HEADER_BUTTON = {
  minHeight: 44,
  justifyContent: "center" as const,
  alignItems: "center" as const,
};

export function HeaderBackButton() {
  const router = useRouter();
  const { t } = useTranslation();
  const tint = useThemeColor({}, "tint");
  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={[HEADER_BUTTON, { paddingRight: Spacing.sm, paddingVertical: Spacing.sm }]}
      accessibilityRole="button"
      accessibilityLabel={t("common.back")}
    >
      <IconSymbol name="chevron.left" size={24} color={tint} />
    </TouchableOpacity>
  );
}
