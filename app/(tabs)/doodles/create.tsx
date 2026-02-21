import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDoodlesStore } from '@/stores/useDoodlesStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 48;
const CONTENT_PADDING = Spacing.md;
const CONTENT_HEIGHT = SCREEN_HEIGHT - TAB_BAR_HEIGHT - 120;

type ImageSlot = 'wall' | 'sketch';
type TabId = 'muro' | 'boceto';

export default function DoodlesCreateScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ doodleId?: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const getDoodle = useDoodlesStore((s) => s.getDoodle);

  const [activeTab, setActiveTab] = useState<TabId>('muro');
  const [wallUri, setWallUri] = useState<string | null>(null);
  const [sketchUri, setSketchUri] = useState<string | null>(null);
  const [loading, setLoading] = useState<ImageSlot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const doodleId = params.doodleId ?? undefined;

  useEffect(() => {
    if (doodleId) {
      const doodle = getDoodle(doodleId);
      if (doodle) {
        if (doodle.wallImageUri) setWallUri(doodle.wallImageUri);
        if (doodle.sketchImageUri) setSketchUri(doodle.sketchImageUri);
      }
    }
  }, [doodleId, getDoodle]);

  const pickFromGallery = useCallback(
    async (slot: ImageSlot) => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError(t('doodles.permissionDenied'));
        return;
      }
      setError(null);
      setLoading(slot);
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: 0.85,
        });
        if (result.canceled || !result.assets[0]) {
          setLoading(null);
          return;
        }
        const uri = result.assets[0].uri;
        if (slot === 'wall') setWallUri(uri);
        else setSketchUri(uri);
      } catch (e) {
        setError(e instanceof Error ? e.message : t('common.error'));
      } finally {
        setLoading(null);
      }
    },
    [t]
  );

  const takePhoto = useCallback(
    async (slot: ImageSlot) => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setError(t('doodles.cameraPermissionDenied'));
        return;
      }
      setError(null);
      setLoading(slot);
      try {
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: false,
          quality: 0.85,
        });
        if (result.canceled || !result.assets[0]) {
          setLoading(null);
          return;
        }
        const uri = result.assets[0].uri;
        if (slot === 'wall') setWallUri(uri);
        else setSketchUri(uri);
      } catch (e) {
        setError(e instanceof Error ? e.message : t('common.error'));
      } finally {
        setLoading(null);
      }
    },
    [t]
  );

  const bothLoaded = Boolean(wallUri && sketchUri);

  const contentArea = (() => {
    if (bothLoaded) {
      return (
        <View style={styles.superpositionWrap}>
          <Image
            source={{ uri: wallUri! }}
            style={styles.superpositionLayer}
            resizeMode="contain"
          />
          <Image
            source={{ uri: sketchUri! }}
            style={[styles.superpositionLayer, styles.sketchLayer]}
            resizeMode="contain"
          />
        </View>
      );
    }

    if (activeTab === 'muro') {
      if (!wallUri) {
        return (
          <PlaceholderSlot
            icon="wallpaper"
            label={t('doodles.wallImage')}
            onTakePhoto={() => takePhoto('wall')}
            onPickGallery={() => pickFromGallery('wall')}
            loading={loading === 'wall'}
            theme={theme}
            t={t}
          />
        );
      }
      return (
        <View style={styles.singleImageWrap}>
          <Image
            source={{ uri: wallUri }}
            style={styles.singleImage}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={[styles.replaceBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setWallUri(null)}
          >
            <ThemedText style={[styles.replaceBtnText, { color: theme.textSecondary }]}>
              {t('doodles.replaceImage')}
            </ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    if (activeTab === 'boceto') {
      if (!sketchUri) {
        return (
          <PlaceholderSlot
            icon="brush"
            label={t('doodles.sketchImage')}
            onTakePhoto={() => takePhoto('sketch')}
            onPickGallery={() => pickFromGallery('sketch')}
            loading={loading === 'sketch'}
            theme={theme}
            t={t}
          />
        );
      }
      return (
        <View style={styles.singleImageWrap}>
          <Image
            source={{ uri: sketchUri }}
            style={styles.singleImage}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={[styles.replaceBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setSketchUri(null)}
          >
            <ThemedText style={[styles.replaceBtnText, { color: theme.textSecondary }]}>
              {t('doodles.replaceImage')}
            </ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  })();

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.tabBar, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'muro' && { borderBottomColor: theme.tint, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('muro')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'muro' }}
          accessibilityLabel={t('doodles.wallImage')}
        >
          <MaterialIcons
            name="wallpaper"
            size={20}
            color={activeTab === 'muro' ? theme.tint : theme.textSecondary}
          />
          <ThemedText
            style={[
              styles.tabLabel,
              { color: activeTab === 'muro' ? theme.tint : theme.textSecondary },
            ]}
          >
            {t('doodles.tabWall')}
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'boceto' && { borderBottomColor: theme.tint, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('boceto')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'boceto' }}
          accessibilityLabel={t('doodles.sketchImage')}
        >
          <MaterialIcons
            name="brush"
            size={20}
            color={activeTab === 'boceto' ? theme.tint : theme.textSecondary}
          />
          <ThemedText
            style={[
              styles.tabLabel,
              { color: activeTab === 'boceto' ? theme.tint : theme.textSecondary },
            ]}
          >
            {t('doodles.tabSketch')}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {contentArea}
      </View>

      {error ? (
        <View style={styles.errorWrap}>
          <ThemedText style={[styles.error, { color: theme.error }]}>{error}</ThemedText>
        </View>
      ) : null}
    </ThemedView>
  );
}

function PlaceholderSlot({
  icon,
  label,
  onTakePhoto,
  onPickGallery,
  loading,
  theme,
  t,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onTakePhoto: () => void;
  onPickGallery: () => void;
  loading: boolean;
  theme: (typeof Colors)['light'];
  t: (key: string) => string;
}) {
  return (
    <View style={[styles.placeholderWrap, { backgroundColor: theme.backgroundSecondary }]}>
      <MaterialIcons name={icon} size={48} color={theme.textSecondary} />
      <ThemedText style={[styles.placeholderLabel, { color: theme.textSecondary }]}>
        {label}
      </ThemedText>
      <View style={styles.placeholderButtons}>
        <TouchableOpacity
          style={[styles.placeholderBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={onTakePhoto}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel={t('doodles.takePhoto')}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.tint} />
          ) : (
            <>
              <MaterialIcons name="camera-alt" size={24} color={theme.tint} />
              <ThemedText style={[styles.placeholderBtnText, { color: theme.text }]}>
                {t('doodles.takePhoto')}
              </ThemedText>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.placeholderBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={onPickGallery}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel={t('doodles.pickFromGallery')}
        >
          <MaterialIcons name="photo-library" size={24} color={theme.tint} />
          <ThemedText style={[styles.placeholderBtnText, { color: theme.text }]}>
            {t('doodles.pickFromGallery')}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  tabLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  content: {
    flex: 1,
    padding: CONTENT_PADDING,
    minHeight: CONTENT_HEIGHT,
  },
  placeholderWrap: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  placeholderLabel: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  placeholderButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  placeholderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minHeight: 48,
  },
  placeholderBtnText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  singleImageWrap: {
    flex: 1,
    position: 'relative',
  },
  singleImage: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.md,
  },
  replaceBtn: {
    position: 'absolute',
    bottom: Spacing.md,
    alignSelf: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  replaceBtnText: {
    fontSize: Typography.fontSize.sm,
  },
  superpositionWrap: {
    flex: 1,
    position: 'relative',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  superpositionLayer: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  sketchLayer: {
    opacity: 0.85,
  },
  errorWrap: {
    padding: Spacing.md,
  },
  error: {
    fontSize: Typography.fontSize.sm,
  },
});
