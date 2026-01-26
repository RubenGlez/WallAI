import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function WallScreen() {
  const { t } = useTranslation();
  
  return (
    <ThemedView style={styles.container} safeArea="top">
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          {t('wall.title')}
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {t('wall.subtitle')}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
});
