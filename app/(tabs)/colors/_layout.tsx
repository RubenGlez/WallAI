import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Stack, useNavigation } from "expo-router";
import { TouchableOpacity } from "react-native";

import { Spacing } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";

function HeaderBackButton() {
  const navigation = useNavigation();
  const tint = useThemeColor({}, "tint");
  return (
    <TouchableOpacity
      onPress={navigation.goBack}
      style={{ paddingRight: Spacing.sm, paddingVertical: Spacing.sm }}
      accessibilityRole="button"
      accessibilityLabel="Volver"
    >
      <MaterialIcons name="arrow-back" size={24} color={tint} />
    </TouchableOpacity>
  );
}

const headerWithBackOptions = {
  headerShown: true,
  headerBackTitle: "",
  headerShadowVisible: false,
  headerLeft: () => <HeaderBackButton />,
};

export default function ColorsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="brands" options={headerWithBackOptions} />
      <Stack.Screen name="all-series" options={headerWithBackOptions} />
      <Stack.Screen name="series/[brandId]" options={headerWithBackOptions} />
      <Stack.Screen name="grid/[seriesId]" options={headerWithBackOptions} />
    </Stack>
  );
}
