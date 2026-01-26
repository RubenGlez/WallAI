import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  const { t } = useTranslation();
  
  return (
    <ThemedView style={styles.container} safeArea="top">
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          {t('home.title')}
        </ThemedText>
        <ThemedText style={styles.tagline}>
          {t('home.tagline')}
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {t('home.subtitle')}
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
  tagline: {
    fontSize: 18,
    marginBottom: 16,
    opacity: 0.8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    paddingHorizontal: 32,
  },
});
