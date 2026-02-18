import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ProfileScreen() {
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.container} safeArea="top">
      <ThemedText type="title">{t('tabs.profile')}</ThemedText>
      <ThemedText style={styles.placeholder}>{t('profile.placeholder')}</ThemedText>
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
