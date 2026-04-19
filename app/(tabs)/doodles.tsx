import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";

import { DoodleCard } from "@/components/doodle-card";
import { EmptyStateCard } from "@/components/empty-state-card";
import { FloatingActionButton } from "@/components/floating-action-button";
import { Screen } from "@/components/screen";
import { ScreenHeader } from "@/components/screen-header";
import { SwipeableRow } from "@/components/swipeable-row";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Accent, Spacing } from "@/constants/theme";
import { confirmDelete } from "@/lib/confirm-delete";
import { useDoodlesStore } from "@/stores/useDoodlesStore";
import type { Doodle } from "@/types";

function SwipeableDoodleCard({
  doodle,
  onPress,
  onDelete,
}: {
  doodle: Doodle;
  onPress: () => void;
  onDelete: () => void;
}) {
  return (
    <SwipeableRow onDelete={onDelete}>
      <DoodleCard doodle={doodle} onPress={onPress} />
    </SwipeableRow>
  );
}

export default function DoodlesIndexScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const doodles = useDoodlesStore((s) => s.doodles);
  const removeDoodle = useDoodlesStore((s) => s.removeDoodle);

  const handleNewDoodle = () => router.push("/doodles/create");

  const handleDelete = (doodle: Doodle) => {
    confirmDelete({
      title: t("doodles.deleteTitle", { name: doodle.name }),
      message: t("doodles.deleteMessage"),
      confirmLabel: t("common.delete"),
      cancelLabel: t("common.cancel"),
      onConfirm: () => removeDoodle(doodle.id),
    });
  };

  return (
    <Screen>
      <View style={styles.container}>
        <ScreenHeader
          title={t("doodles.myDoodles")}
          subtitle={t("doodles.subtitle")}
        />

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
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
                <SwipeableDoodleCard
                  key={doodle.id}
                  doodle={doodle}
                  onPress={() => router.push({ pathname: "/doodles/create", params: { doodleId: doodle.id } })}
                  onDelete={() => handleDelete(doodle)}
                />
              ))}
            </View>
          )}
        </ScrollView>

        <FloatingActionButton
          style={styles.fab}
          onPress={handleNewDoodle}
          accessibilityLabel={t("doodles.newDoodle")}
          icon={<IconSymbol name="plus" size={26} color={Accent.onPrimary} />}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  scroll: {
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  fab: {
    position: "absolute",
    bottom: Spacing.md,
    right: Spacing.md,
  },
});
