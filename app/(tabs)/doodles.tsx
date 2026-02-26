import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { EmptyStateCard } from "@/components/empty-state-card";
import { FloatingActionButton } from "@/components/floating-action-button";
import { Screen } from "@/components/screen";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { getListCardWidth, LIST_GAP } from "@/constants/list-layout";
import { BorderRadius, Shadows, Spacing, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatRelativeDate } from "@/lib/date";
import { useDoodlesStore } from "@/stores/useDoodlesStore";
import type { Doodle } from "@/types";

const CARD_WIDTH = getListCardWidth();
const CARD_PADDING = Spacing.md;
const THUMBNAIL_ASPECT = 4 / 3;
const THUMBNAIL_HEIGHT = (CARD_WIDTH - CARD_PADDING * 2) / THUMBNAIL_ASPECT;

function DoodleCard({
  doodle,
  onPress,
}: {
  doodle: Doodle;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const thumbnailUri =
    doodle.thumbnailUri ??
    doodle.exportImageUri ??
    doodle.sketchImageUri ??
    doodle.wallImageUri;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.thumbnailWrap,
          { backgroundColor: theme.backgroundSecondary },
        ]}
      >
        {thumbnailUri ? (
          <Image
            source={{ uri: thumbnailUri }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <IconSymbol
              name="paintbrush"
              size={28}
              color={theme.textSecondary}
            />
          </View>
        )}
      </View>
      <ThemedText style={styles.cardTitle} numberOfLines={1}>
        {doodle.name || t("common.untitled")}
      </ThemedText>
      <ThemedText style={[styles.cardDate, { color: theme.textSecondary }]}>
        {formatRelativeDate(doodle.createdAt)}
      </ThemedText>
    </TouchableOpacity>
  );
}

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
  card: {
    width: CARD_WIDTH,
    padding: CARD_PADDING,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: LIST_GAP,
    ...Shadows.sm,
  },
  thumbnailWrap: {
    width: CARD_WIDTH - CARD_PADDING * 2,
    height: THUMBNAIL_HEIGHT,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  thumbnailPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  cardDate: {
    fontSize: Typography.fontSize.xs,
  },
});
