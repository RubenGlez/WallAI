import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getSeriesById } from '@/stores/useCatalogStore';

export default function ColorGridScreen() {
  const { seriesId } = useLocalSearchParams<{ seriesId: string }>();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const series = seriesId ? getSeriesById(seriesId) : undefined;

  useEffect(() => {
    if (series) {
      navigation.setOptions({ title: series.name });
    }
  }, [series, navigation]);

  return (
    <ThemedView style={styles.container} safeArea="top">
      <ThemedText type="title">{t('colors.gridTitle')}</ThemedText>
      <ThemedText style={styles.placeholder}>{t('colors.gridPlaceholder')}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  placeholder: {
    marginTop: 8,
    opacity: 0.7,
  },
});
