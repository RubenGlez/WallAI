import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";

import { DoodleCard } from "@/components/doodle-card";
import { EmptyStateCard } from "@/components/empty-state-card";
import { FloatingActionButton } from "@/components/floating-action-button";
import { Screen } from "@/components/screen";
import { ScreenHeader } from "@/components/screen-header";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useDoodlesStore } from "@/stores/useDoodlesStore";

export default function DoodlesIndexScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme } = useTheme();
  const doodles = useDoodlesStore((s) => s.doodles);

  const handleNewDoodle = () => {
    router.push("/doodles/create");
  };

  return (
    <Screen>
      <View style={styles.container}>
        <ScreenHeader
          title={t("doodles.myDoodles")}
          subtitle={t("doodles.subtitle")}
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          {doodles.length === 0 ? (
            <EmptyStateCard
              icon="paintbrush"
              title={t("doodles.emptyTitle")}
              subtitle={t("doodles.emptyHint")}
              onPress={handleNewDoodle}
            />
          ) : (
            <View style={styles.grid}>
              {doodles.map((doodle) => (
                <DoodleCard
                  key={doodle.id}
                  doodle={doodle}
                  onPress={() => {
                    router.push({
                      pathname: "/doodles/create",
                      params: { doodleId: doodle.id },
                    });
                  }}
                />
              ))}
            </View>
          )}
        </ScrollView>

        <FloatingActionButton
          variant="primary"
          style={styles.fab}
          onPress={handleNewDoodle}
          accessibilityLabel={t("doodles.newDoodle")}
          icon={<IconSymbol name="plus" size={28} color={theme.background} />}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  fab: {
    position: "absolute",
    bottom: Spacing.md,
    right: Spacing.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
