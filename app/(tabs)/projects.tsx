import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePaletteStore } from "@/stores/usePaletteStore";
import { useProjectsStore } from "@/stores/useProjectsStore";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

type EditTarget = { type: "palette"; id: string; name: string } | { type: "wall"; id: string; name: string };

export default function ProjectsScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const palettes = usePaletteStore((s) => s.palettes);
  const setActivePalette = usePaletteStore((s) => s.setActivePalette);
  const updatePaletteName = usePaletteStore((s) => s.updatePaletteName);
  const deletePalette = usePaletteStore((s) => s.deletePalette);

  const projects = useProjectsStore((s) => s.projects);
  const setActiveProject = useProjectsStore((s) => s.setActiveProject);
  const updateProject = useProjectsStore((s) => s.updateProject);
  const deleteProject = useProjectsStore((s) => s.deleteProject);

  const [editing, setEditing] = useState<EditTarget | null>(null);
  const [editName, setEditName] = useState("");

  const handleVisualizePalette = useCallback(
    (paletteId: string) => {
      setActivePalette(paletteId);
      router.navigate("/colors" as never);
    },
    [setActivePalette, router]
  );

  const handleVisualizeWall = useCallback(
    (projectId: string) => {
      setActiveProject(projectId);
      router.navigate("/wall" as never);
    },
    [setActiveProject, router]
  );

  const openRename = useCallback((target: EditTarget) => {
    setEditing(target);
    setEditName(target.name);
  }, []);

  const saveRename = useCallback(() => {
    if (!editing || !editName.trim()) {
      setEditing(null);
      return;
    }
    if (editing.type === "palette") {
      updatePaletteName(editing.id, editName.trim());
    } else {
      updateProject(editing.id, { name: editName.trim() });
    }
    setEditing(null);
  }, [editing, editName, updatePaletteName, updateProject]);

  const handleRemovePalette = useCallback(
    (id: string, name: string) => {
      Alert.alert(
        t("projects.removePaletteTitle"),
        t("projects.removePaletteMessage"),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("projects.remove"),
            style: "destructive",
            onPress: () => deletePalette(id),
          },
        ]
      );
    },
    [t, deletePalette]
  );

  const handleRemoveWall = useCallback(
    (id: string) => {
      Alert.alert(
        t("projects.removeWallTitle"),
        t("projects.removeWallMessage"),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("projects.remove"),
            style: "destructive",
            onPress: () => deleteProject(id),
          },
        ]
      );
    },
    [t, deleteProject]
  );

  const thumbnailUri = (project: { sketchImageUri?: string; backgroundImageUri?: string }) =>
    project.sketchImageUri ?? project.backgroundImageUri;

  return (
    <ThemedView style={styles.container} safeArea="top">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {t("projects.title")}
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            {t("projects.subtitle")}
          </ThemedText>
        </View>

        {/* My palettes */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          {t("projects.palettesSection")}
        </ThemedText>
        {palettes.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.backgroundSecondary }]}>
            <IconSymbol name="swatchpalette" size={32} color={theme.tabIconDefault} />
            <ThemedText style={styles.emptyText}>{t("projects.noPalettes")}</ThemedText>
          </View>
        ) : (
          <View style={styles.cardList}>
            {palettes.map((palette) => (
              <View
                key={palette.id}
                style={[styles.card, { backgroundColor: theme.card }, Shadows.md]}
              >
                <View style={styles.cardMain}>
                  <View style={styles.swatchRow}>
                    {palette.colors.slice(0, 6).map((c) => (
                      <View
                        key={c.id}
                        style={[
                          styles.swatch,
                          { backgroundColor: c.hex },
                          palette.colors.length > 1 && styles.swatchBorder,
                        ]}
                      />
                    ))}
                    {palette.colors.length === 0 && (
                      <View style={[styles.swatch, styles.swatchEmpty, { borderColor: theme.border }]} />
                    )}
                  </View>
                  <ThemedText numberOfLines={1} style={styles.cardTitle}>
                    {palette.name || t("projects.paletteName")}
                  </ThemedText>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => handleVisualizePalette(palette.id)}
                    style={styles.actionBtn}
                    accessibilityLabel={t("projects.visualize")}
                  >
                    <IconSymbol name="eye" size={22} color={theme.tint} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => openRename({ type: "palette", id: palette.id, name: palette.name })}
                    style={styles.actionBtn}
                    accessibilityLabel={t("projects.edit")}
                  >
                    <IconSymbol name="pencil.and.outline" size={22} color={theme.tint} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleRemovePalette(palette.id, palette.name)}
                    style={styles.actionBtn}
                    accessibilityLabel={t("projects.remove")}
                  >
                    <IconSymbol name="trash" size={22} color={theme.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* My walls */}
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          {t("projects.wallsSection")}
        </ThemedText>
        {projects.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.backgroundSecondary }]}>
            <IconSymbol name="square.stack.3d.up" size={32} color={theme.tabIconDefault} />
            <ThemedText style={styles.emptyText}>{t("projects.noWalls")}</ThemedText>
          </View>
        ) : (
          <View style={styles.cardList}>
            {projects.map((project) => {
              const uri = thumbnailUri(project);
              return (
                <View
                  key={project.id}
                  style={[styles.card, { backgroundColor: theme.card }, Shadows.md]}
                >
                  <View style={styles.cardMain}>
                    <View style={[styles.thumb, { backgroundColor: theme.backgroundSecondary }]}>
                      {uri ? (
                        <Image source={{ uri }} style={styles.thumbImage} resizeMode="cover" />
                      ) : (
                        <IconSymbol
                          name="square.stack.3d.up"
                          size={28}
                          color={theme.tabIconDefault}
                        />
                      )}
                    </View>
                    <ThemedText numberOfLines={1} style={styles.cardTitle}>
                      {project.name || t("projects.projectName")}
                    </ThemedText>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      onPress={() => handleVisualizeWall(project.id)}
                      style={styles.actionBtn}
                      accessibilityLabel={t("projects.visualize")}
                    >
                      <IconSymbol name="eye" size={22} color={theme.tint} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        openRename({ type: "wall", id: project.id, name: project.name })
                      }
                      style={styles.actionBtn}
                      accessibilityLabel={t("projects.edit")}
                    >
                      <IconSymbol name="pencil.and.outline" size={22} color={theme.tint} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRemoveWall(project.id)}
                      style={styles.actionBtn}
                      accessibilityLabel={t("projects.remove")}
                    >
                      <IconSymbol name="trash" size={22} color={theme.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Rename modal */}
      <Modal
        visible={editing !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditing(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setEditing(null)}
        >
          <View
            style={[styles.modalContent, { backgroundColor: theme.card }]}
            onStartShouldSetResponder={() => true}
          >
            <ThemedText type="defaultSemiBold" style={styles.modalTitle}>
              {t("projects.rename")}
            </ThemedText>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder={
                editing?.type === "palette"
                  ? t("projects.paletteName")
                  : t("projects.projectName")
              }
              placeholderTextColor={theme.tabIconDefault}
              style={[
                styles.input,
                {
                  color: theme.text,
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                },
              ]}
              autoFocus
              selectTextOnFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setEditing(null)}
                style={[styles.modalBtn, { backgroundColor: theme.backgroundSecondary }]}
              >
                <ThemedText style={{ color: theme.text }}>{t("common.cancel")}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveRename}
                style={[styles.modalBtn, { backgroundColor: theme.tint }]}
              >
                <ThemedText style={{ color: theme.background }}>{t("common.save")}</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    fontSize: Typography.fontSize.md,
  },
  emptyCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  emptyText: {
    marginTop: Spacing.sm,
    textAlign: "center",
    opacity: 0.8,
  },
  cardList: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  cardMain: {
    flex: 1,
    minWidth: 0,
  },
  swatchRow: {
    flexDirection: "row",
    gap: 4,
    marginBottom: Spacing.xs,
  },
  swatch: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
  },
  swatchBorder: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  swatchEmpty: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
    overflow: "hidden",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  cardTitle: {
    fontSize: Typography.fontSize.md,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  actionBtn: {
    padding: Spacing.sm,
    minWidth: Spacing.touchTarget,
    minHeight: Spacing.touchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  modalContent: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  modalTitle: {
    marginBottom: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.md,
    marginBottom: Spacing.lg,
  },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  modalBtn: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
});
