import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

import { Spacing } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";

const HEADER_BUTTON = {
  minHeight: 44,
  justifyContent: "center" as const,
  alignItems: "center" as const,
};

export function HeaderBackButton() {
  const router = useRouter();
  const tint = useThemeColor({}, "tint");
  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={[HEADER_BUTTON, { paddingRight: Spacing.sm, paddingVertical: Spacing.sm }]}
      accessibilityRole="button"
      accessibilityLabel="Volver"
    >
      <MaterialIcons name="arrow-back" size={24} color={tint} />
    </TouchableOpacity>
  );
}
