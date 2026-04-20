import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  Accent,
  BorderRadius,
  FontFamily,
  Spacing,
  Surface,
  Typography,
} from '@/constants/theme';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { useAnalytics } from '@/hooks/use-analytics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type SFSymbol = React.ComponentProps<typeof IconSymbol>['name'];

const SLIDES: { key: string; icon: SFSymbol; titleKey: string; subtitleKey: string }[] = [
  {
    key: 'catalog',
    icon: 'square.grid.2x2',
    titleKey: 'onboarding.slide1.title',
    subtitleKey: 'onboarding.slide1.subtitle',
  },
  {
    key: 'palette',
    icon: 'paintpalette.fill',
    titleKey: 'onboarding.slide2.title',
    subtitleKey: 'onboarding.slide2.subtitle',
  },
  {
    key: 'wall',
    icon: 'square.stack.3d.up.fill',
    titleKey: 'onboarding.slide3.title',
    subtitleKey: 'onboarding.slide3.subtitle',
  },
];

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const { captureOnboardingCompleted, captureOnboardingSkipped } = useAnalytics();
  const [activeIndex, setActiveIndex] = useState(0);

  const finish = () => {
    completeOnboarding();
    captureOnboardingCompleted();
    router.replace('/(tabs)');
  };

  const skip = () => {
    completeOnboarding();
    captureOnboardingSkipped(activeIndex);
    router.replace('/(tabs)');
  };

  const next = () => {
    if (activeIndex < SLIDES.length - 1) {
      setActiveIndex(activeIndex + 1);
    } else {
      finish();
    }
  };

  const isLast = activeIndex === SLIDES.length - 1;
  const slide = SLIDES[activeIndex];

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing.md }]}>
      <View style={styles.topBar}>
        <ThemedText style={styles.appLabel}>SprayDeck</ThemedText>
        {!isLast && (
          <TouchableOpacity onPress={skip} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ThemedText style={styles.skip}>{t('onboarding.skip')}</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.slide}>
        <View style={styles.iconWrap}>
          <IconSymbol name={slide.icon} size={64} color={Accent.primary} />
        </View>
        <ThemedText style={styles.title}>{t(slide.titleKey)}</ThemedText>
        <ThemedText style={styles.subtitle}>{t(slide.subtitleKey)}</ThemedText>
      </View>

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.footer}>
        <Button variant="primary" size="lg" fullWidth onPress={next}>
          {isLast ? t('onboarding.getStarted') : t('onboarding.next')}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Surface.lowest,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  appLabel: {
    color: Accent.primary,
    fontFamily: FontFamily.displaySemiBold,
    fontSize: Typography.fontSize.md,
  },
  skip: {
    color: Accent.onSurfaceMuted,
    fontSize: Typography.fontSize.sm,
    fontFamily: FontFamily.displayMedium,
  },
  slide: {
    flex: 1,
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    backgroundColor: `${Accent.primary}14`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: FontFamily.displayBold,
    fontSize: Typography.fontSize.xxl,
    textAlign: 'center',
    color: Accent.onSurface,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    textAlign: 'center',
    color: Accent.onSurfaceMuted,
    lineHeight: 26,
  },
  dots: {
    flexDirection: 'row',
    gap: Spacing.sm,
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Surface.highest,
  },
  dotActive: {
    backgroundColor: Accent.primary,
    width: 20,
  },
  footer: {
    paddingHorizontal: Spacing.md,
  },
});
