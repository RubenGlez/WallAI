import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { Surface } from '@/constants/theme';
import { useOnboardingStore } from '@/stores/useOnboardingStore';

export default function Index() {
  const hasHydrated = useOnboardingStore((s) => s._hasHydrated);
  const hasCompleted = useOnboardingStore((s) => s.hasCompletedOnboarding);

  if (!hasHydrated) {
    return <View style={{ flex: 1, backgroundColor: Surface.lowest }} />;
  }

  return <Redirect href={hasCompleted ? '/(tabs)' : '/onboarding'} />;
}
