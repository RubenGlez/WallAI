import { useTheme } from "@/hooks/use-theme";
import { StyleSheet } from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = {
  children: React.ReactNode;
  safeBottom?: boolean;
};
export function Screen({ children, safeBottom }: ScreenProps) {
  const { theme } = useTheme();

  const edges: Edge[] = ["top", "left", "right"];
  if (safeBottom) {
    edges.push("bottom");
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={edges}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
