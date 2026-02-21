import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { Button } from '@/components/button';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDoodlesStore } from '@/stores/useDoodlesStore';
import type { Doodle } from '@/types';

const { width } = Dimensions.get('window');
const FAB_SIZE = 56;
const NUM_COLUMNS = 2;
const GAP = Spacing.sm;
const CARD_PADDING = Spacing.md;
const CARD_WIDTH =
  (width - Spacing.md * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
const THUMBNAIL_ASPECT = 4 / 3;
const THUMBNAIL_HEIGHT = (CARD_WIDTH - CARD_PADDING * 2) / THUMBNAIL_ASPECT;

function formatDoodleDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(d);
  if (diffDays === 1) return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(d);
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'short' }).format(d);
}

function DoodleCard({
  doodle,
  onPress,
}: {
  doodle: Doodle;
  onPress: () => void;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const thumbnailUri =
    doodle.thumbnailUri ?? doodle.exportImageUri ?? doodle.sketchImageUri ?? doodle.wallImageUri;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.thumbnailWrap, { backgroundColor: theme.backgroundSecondary }]}>
        {thumbnailUri ? (
          <Image
            source={{ uri: thumbnailUri }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <MaterialIcons
              name="brush"
              size={28}
              color={theme.textSecondary}
            />
          </View>
        )}
      </View>
      <ThemedText style={styles.cardTitle} numberOfLines={1}>
        {doodle.name || 'Sin nombre'}
      </ThemedText>
      <ThemedText style={[styles.cardDate, { color: theme.textSecondary }]}>
        {formatDoodleDate(doodle.createdAt)}
      </ThemedText>
    </TouchableOpacity>
  );
}

export default function DoodlesIndexScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const doodles = useDoodlesStore((s) => s.doodles);

  const handleNewDoodle = () => {
    router.push('/(tabs)/doodles/create');
  };

  return (
    <ThemedView style={styles.container} safeArea="top">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title={t('doodles.myDoodles')}
          subtitle={t('doodles.subtitle')}
        />

        {doodles.length === 0 ? (
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.emptyCard,
              {
                backgroundColor: theme.backgroundSecondary,
                borderColor: theme.border,
              },
            ]}
            onPress={handleNewDoodle}
          >
            <View
              style={[styles.emptyIconWrap, { backgroundColor: theme.card }]}
            >
              <MaterialIcons name="brush" size={28} color={theme.tint} />
            </View>
            <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
              {t('doodles.emptyTitle')}
            </ThemedText>
            <ThemedText
              style={[styles.emptySubtitle, { color: theme.textSecondary }]}
            >
              {t('doodles.emptyHint')}
            </ThemedText>
          </TouchableOpacity>
        ) : (
          <View style={styles.grid}>
            {doodles.map((doodle) => (
              <DoodleCard
                key={doodle.id}
                doodle={doodle}
                onPress={() => {
                  router.push({ pathname: '/(tabs)/doodles/create', params: { doodleId: doodle.id } });
                }}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <View
        style={[styles.fabContainer, { bottom: Spacing.md }]}
        pointerEvents="box-none"
      >
        <Button
          variant="primary"
          size="icon"
          style={[styles.fab, { backgroundColor: theme.tint }]}
          onPress={handleNewDoodle}
          accessibilityLabel={t('doodles.newDoodle')}
          icon={<MaterialIcons name="add" size={28} color={theme.background} />}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl + 80,
  },
  fabContainer: {
    position: 'absolute',
    right: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
  emptyCard: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    minHeight: 140,
    ...Shadows.sm,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    padding: CARD_PADDING,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: GAP,
    ...Shadows.sm,
  },
  thumbnailWrap: {
    width: CARD_WIDTH - CARD_PADDING * 2,
    height: THUMBNAIL_HEIGHT,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
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
