import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          WallAI
        </ThemedText>
        <ThemedText style={styles.tagline}>
          From sketch to wall, guided by AI
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Plan your graffiti pieces with real spray colors and precise wall overlays
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
