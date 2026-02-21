import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import Slider from '@react-native-community/slider';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
  Shadows,
} from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDoodlesStore } from '@/stores/useDoodlesStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 48;
const CONTENT_PADDING = Spacing.md;
const CONTENT_HEIGHT = SCREEN_HEIGHT - TAB_BAR_HEIGHT - 120;
const DEFAULT_SKETCH_OPACITY = 0.85;
const DEFAULT_WALL_OPACITY = 1;
const TOOLBAR_ICON_SIZE = 40;
const TOOLBAR_GAP = Spacing.sm;
const TOOLBAR_PILL_PADDING_H = Spacing.sm;
const TOOLBAR_PILL_WIDTH =
  2 * TOOLBAR_PILL_PADDING_H + 5 * TOOLBAR_ICON_SIZE + 4 * TOOLBAR_GAP;

type ImageSlot = 'wall' | 'sketch';
type TabId = 'muro' | 'boceto';

export default function DoodlesCreateScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ doodleId?: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();
  const getDoodle = useDoodlesStore((s) => s.getDoodle);
  const addDoodle = useDoodlesStore((s) => s.addDoodle);
  const updateDoodle = useDoodlesStore((s) => s.updateDoodle);

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

  const wallOffsetX = useSharedValue(0);
  const wallOffsetY = useSharedValue(0);
  const wallSavedOffsetX = useSharedValue(0);
  const wallSavedOffsetY = useSharedValue(0);
  const wallScale = useSharedValue(1);
  const wallSavedScale = useSharedValue(1);
  const wallRotation = useSharedValue(0);
  const wallSavedRotation = useSharedValue(0);
  const wallFlipX = useSharedValue(1);
  const wallFlipY = useSharedValue(1);
  const wallOpacity = useSharedValue(DEFAULT_WALL_OPACITY);

  const sketchOffsetX = useSharedValue(0);
  const sketchOffsetY = useSharedValue(0);
  const sketchSavedOffsetX = useSharedValue(0);
  const sketchSavedOffsetY = useSharedValue(0);
  const sketchScale = useSharedValue(1);
  const sketchSavedScale = useSharedValue(1);
  const sketchRotation = useSharedValue(0);
  const sketchSavedRotation = useSharedValue(0);
  const sketchFlipX = useSharedValue(1);
  const sketchFlipY = useSharedValue(1);
  const sketchOpacity = useSharedValue(DEFAULT_SKETCH_OPACITY);

  const [wallOpacityAmount, setWallOpacityAmount] = useState(DEFAULT_WALL_OPACITY);
  const [sketchOpacityAmount, setSketchOpacityAmount] = useState(DEFAULT_SKETCH_OPACITY);
  const [toolbarView, setToolbarView] = useState<'icons' | 'opacity'>('icons');
  const [showNameModal, setShowNameModal] = useState(false);
  const [doodleName, setDoodleName] = useState('');

  const resetTransform = useCallback(() => {
    if (activeTab === 'muro') {
      wallOffsetX.value = 0;
      wallOffsetY.value = 0;
      wallSavedOffsetX.value = 0;
      wallSavedOffsetY.value = 0;
      wallScale.value = 1;
      wallSavedScale.value = 1;
      wallRotation.value = 0;
      wallSavedRotation.value = 0;
      wallFlipX.value = 1;
      wallFlipY.value = 1;
      wallOpacity.value = DEFAULT_WALL_OPACITY;
      setWallOpacityAmount(DEFAULT_WALL_OPACITY);
    } else {
      sketchOffsetX.value = 0;
      sketchOffsetY.value = 0;
      sketchSavedOffsetX.value = 0;
      sketchSavedOffsetY.value = 0;
      sketchScale.value = 1;
      sketchSavedScale.value = 1;
      sketchRotation.value = 0;
      sketchSavedRotation.value = 0;
      sketchFlipX.value = 1;
      sketchFlipY.value = 1;
      sketchOpacity.value = DEFAULT_SKETCH_OPACITY;
      setSketchOpacityAmount(DEFAULT_SKETCH_OPACITY);
    }
  }, [activeTab, wallOffsetX, wallOffsetY, wallSavedOffsetX, wallSavedOffsetY, wallScale, wallSavedScale, wallRotation, wallSavedRotation, wallFlipX, wallFlipY, wallOpacity, sketchOffsetX, sketchOffsetY, sketchSavedOffsetX, sketchSavedOffsetY, sketchScale, sketchSavedScale, sketchRotation, sketchSavedRotation, sketchFlipX, sketchFlipY, sketchOpacity]);

  const openSaveModal = useCallback(() => {
    if (!wallUri || !sketchUri) return;
    setDoodleName(doodleId ? (getDoodle(doodleId)?.name ?? '') : '');
    setShowNameModal(true);
  }, [wallUri, sketchUri, doodleId, getDoodle]);

  const handleConfirmSave = useCallback(() => {
    if (!wallUri || !sketchUri) return;
    const name = doodleName.trim() || t('doodles.defaultDoodleName');
    const transformData = {
      wall: {
        offsetX: wallOffsetX.value,
        offsetY: wallOffsetY.value,
        scale: wallScale.value,
        rotation: wallRotation.value,
        flipX: wallFlipX.value,
        flipY: wallFlipY.value,
        opacity: wallOpacity.value,
      },
      sketch: {
        offsetX: sketchOffsetX.value,
        offsetY: sketchOffsetY.value,
        scale: sketchScale.value,
        rotation: sketchRotation.value,
        flipX: sketchFlipX.value,
        flipY: sketchFlipY.value,
        opacity: sketchOpacity.value,
      },
    };
    if (doodleId) {
      updateDoodle(doodleId, {
        name,
        wallImageUri: wallUri,
        sketchImageUri: sketchUri,
        transformData,
      });
    } else {
      addDoodle({
        name,
        wallImageUri: wallUri,
        sketchImageUri: sketchUri,
        transformData,
      });
    }
    setShowNameModal(false);
    setDoodleName('');
    router.back();
  }, [wallUri, sketchUri, doodleId, doodleName, t, addDoodle, updateDoodle, router,
    wallOffsetX, wallOffsetY, wallScale, wallRotation, wallFlipX, wallFlipY, wallOpacity,
    sketchOffsetX, sketchOffsetY, sketchScale, sketchRotation, sketchFlipX, sketchFlipY, sketchOpacity]);

  const contentArea = (() => {
    if (bothLoaded) {
      return (
        <View style={styles.superpositionWrap}>
          <TransformableLayer
            imageUri={wallUri!}
            offsetX={wallOffsetX}
            offsetY={wallOffsetY}
            savedOffsetX={wallSavedOffsetX}
            savedOffsetY={wallSavedOffsetY}
            scale={wallScale}
            savedScale={wallSavedScale}
            rotation={wallRotation}
            savedRotation={wallSavedRotation}
            flipX={wallFlipX}
            flipY={wallFlipY}
            opacity={wallOpacity}
            isActive={activeTab === 'muro'}
          />
          <TransformableLayer
            imageUri={sketchUri!}
            offsetX={sketchOffsetX}
            offsetY={sketchOffsetY}
            savedOffsetX={sketchSavedOffsetX}
            savedOffsetY={sketchSavedOffsetY}
            scale={sketchScale}
            savedScale={sketchSavedScale}
            rotation={sketchRotation}
            savedRotation={sketchSavedRotation}
            flipX={sketchFlipX}
            flipY={sketchFlipY}
            opacity={sketchOpacity}
            isActive={activeTab === 'boceto'}
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

  const isWallActive = activeTab === 'muro';
  const activeFlipX = isWallActive ? wallFlipX : sketchFlipX;
  const activeFlipY = isWallActive ? wallFlipY : sketchFlipY;
  const activeOpacity = isWallActive ? wallOpacity : sketchOpacity;
  const activeOpacityAmount = isWallActive ? wallOpacityAmount : sketchOpacityAmount;
  const setActiveOpacityAmount = isWallActive ? setWallOpacityAmount : setSketchOpacityAmount;

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
        {bothLoaded ? (
          <View style={styles.contentWithOverlay}>
            {contentArea}
            <View
              style={[styles.toolbarFloatingWrap, { bottom: Spacing.sm }]}
              pointerEvents="box-none"
            >
              <View
                style={[
                  styles.toolbarPill,
                  {
                    width: TOOLBAR_PILL_WIDTH,
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    shadowColor: theme.text,
                  },
                ]}
              >
                {toolbarView === 'icons' ? (
                  <>
                    <TouchableOpacity
                      style={[styles.toolbarBtn, { backgroundColor: theme.tint }]}
                      onPress={openSaveModal}
                      accessibilityRole="button"
                      accessibilityLabel={t('doodles.toolbarSave')}
                    >
                      <MaterialIcons name="save" size={22} color={theme.background} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.toolbarBtn, { backgroundColor: theme.backgroundSecondary }]}
                      onPress={resetTransform}
                      accessibilityRole="button"
                      accessibilityLabel={t('doodles.toolbarReset')}
                    >
                      <MaterialIcons name="restart-alt" size={22} color={theme.tint} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.toolbarBtn, { backgroundColor: theme.backgroundSecondary }]}
                      onPress={() => { activeFlipX.value = -activeFlipX.value; }}
                      accessibilityRole="button"
                      accessibilityLabel={t('doodles.toolbarFlipH')}
                    >
                      <MaterialIcons name="flip" size={22} color={theme.tint} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.toolbarBtn, { backgroundColor: theme.backgroundSecondary }]}
                      onPress={() => { activeFlipY.value = -activeFlipY.value; }}
                      accessibilityRole="button"
                      accessibilityLabel={t('doodles.toolbarFlipV')}
                    >
                      <MaterialIcons name="flip" size={22} color={theme.tint} style={{ transform: [{ rotate: '90deg' }] }} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.toolbarBtn, { backgroundColor: theme.backgroundSecondary }]}
                      onPress={() => setToolbarView('opacity')}
                      accessibilityRole="button"
                      accessibilityLabel={t('doodles.toolbarOpacity')}
                    >
                      <MaterialIcons name="opacity" size={22} color={theme.tint} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[styles.toolbarBtn, { backgroundColor: theme.backgroundSecondary }]}
                      onPress={() => setToolbarView('icons')}
                      accessibilityRole="button"
                      accessibilityLabel={t('doodles.toolbarBack')}
                    >
                      <MaterialIcons name="arrow-back" size={22} color={theme.tint} />
                    </TouchableOpacity>
                    <View style={styles.toolbarOpacityRow}>
                      <MaterialIcons name="opacity" size={20} color={theme.textSecondary} />
                      <Slider
                        style={styles.toolbarSlider}
                        minimumValue={0.1}
                        maximumValue={1}
                        value={activeOpacityAmount}
                        onValueChange={(v) => {
                          setActiveOpacityAmount(v);
                          activeOpacity.value = v;
                        }}
                        minimumTrackTintColor={theme.tint}
                        maximumTrackTintColor={theme.border}
                        thumbTintColor={theme.tint}
                      />
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>
        ) : (
          contentArea
        )}
      </View>

      {error ? (
        <View style={styles.errorWrap}>
          <ThemedText style={[styles.error, { color: theme.error }]}>{error}</ThemedText>
        </View>
      ) : null}

      <Modal
        visible={showNameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNameModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowNameModal(false)}
          />
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <ThemedText style={styles.modalTitle}>{t('doodles.nameYourDoodle')}</ThemedText>
            <TextInput
              style={[
                styles.nameInput,
                {
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder={t('doodles.doodleNamePlaceholder')}
              placeholderTextColor={theme.textSecondary}
              value={doodleName}
              onChangeText={setDoodleName}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: theme.border }]}
                onPress={() => setShowNameModal(false)}
              >
                <ThemedText>{t('common.cancel')}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: theme.tint }]}
                onPress={handleConfirmSave}
              >
                <ThemedText style={[styles.modalButtonPrimaryText, { color: theme.background }]}>
                  {t('common.save')}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ThemedView>
  );
}

type TransformShared = {
  offsetX: SharedValue<number>;
  offsetY: SharedValue<number>;
  savedOffsetX: SharedValue<number>;
  savedOffsetY: SharedValue<number>;
  scale: SharedValue<number>;
  savedScale: SharedValue<number>;
  rotation: SharedValue<number>;
  savedRotation: SharedValue<number>;
  flipX: SharedValue<number>;
  flipY: SharedValue<number>;
  opacity: SharedValue<number>;
};

function TransformableLayer({
  imageUri,
  offsetX,
  offsetY,
  savedOffsetX,
  savedOffsetY,
  scale,
  savedScale,
  rotation,
  savedRotation,
  flipX,
  flipY,
  opacity,
  isActive,
}: { imageUri: string; isActive: boolean } & TransformShared) {
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate((e) => {
          offsetX.value = savedOffsetX.value + e.translationX;
          offsetY.value = savedOffsetY.value + e.translationY;
        })
        .onEnd(() => {
          savedOffsetX.value = offsetX.value;
          savedOffsetY.value = offsetY.value;
        }),
    [offsetX, offsetY, savedOffsetX, savedOffsetY]
  );

  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .onChange((e) => {
          scale.value = scale.value * e.scaleChange;
        })
        .onEnd(() => {
          savedScale.value = scale.value;
        }),
    [scale, savedScale]
  );

  const rotationGesture = useMemo(
    () =>
      Gesture.Rotation()
        .onChange((e) => {
          rotation.value = rotation.value + e.rotationChange;
        })
        .onEnd(() => {
          savedRotation.value = rotation.value;
        }),
    [rotation, savedRotation]
  );

  const composed = useMemo(
    () => Gesture.Simultaneous(panGesture, pinchGesture, rotationGesture),
    [panGesture, pinchGesture, rotationGesture]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    opacity: opacity.value,
    transform: [
      { translateX: offsetX.value },
      { translateY: offsetY.value },
      { scale: scale.value },
      { scaleX: flipX.value },
      { scaleY: flipY.value },
      { rotate: `${rotation.value}rad` },
    ],
  }));

  const content = (
    <Animated.View
      style={[styles.superpositionLayer, animatedStyle]}
      pointerEvents={isActive ? 'box-none' : 'none'}
    >
      <Image
        source={{ uri: imageUri }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="contain"
      />
    </Animated.View>
  );

  if (isActive) {
    return <GestureDetector gesture={composed}>{content}</GestureDetector>;
  }
  return content;
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
    minHeight: 0,
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
  contentWithOverlay: {
    flex: 1,
    position: 'relative',
  },
  toolbarFloatingWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  toolbarPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: 9999,
    borderWidth: 1,
    gap: TOOLBAR_GAP,
    ...Shadows.md,
  },
  toolbarBtn: {
    width: TOOLBAR_ICON_SIZE,
    height: TOOLBAR_ICON_SIZE,
    borderRadius: TOOLBAR_ICON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarOpacityRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minWidth: 0,
  },
  toolbarSlider: {
    flex: 1,
    height: 24,
    minWidth: 60,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  nameInput: {
    height: 44,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: Typography.fontSize.md,
    marginBottom: Spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  modalButtonPrimary: {},
  modalButtonPrimaryText: {
    fontWeight: Typography.fontWeight.semibold,
  },
});
