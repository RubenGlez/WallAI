import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePaletteStore } from "@/stores/usePaletteStore";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, {
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface PaletteCreatorRef {
  open: () => void;
  close: () => void;
}

interface PaletteCreatorProps {
  onCreated?: (paletteId: string) => void;
}

export const PaletteCreator = React.forwardRef<
  PaletteCreatorRef,
  PaletteCreatorProps
>(({ onCreated }, ref) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { createPalette, setActivePalette } = usePaletteStore();
  const [newPaletteName, setNewPaletteName] = useState("");

  useImperativeHandle(ref, () => ({
    open: () => bottomSheetRef.current?.expand(),
    close: () => bottomSheetRef.current?.close(),
  }));

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      setNewPaletteName("");
    }
  }, []);

  const handleCreatePalette = () => {
    if (!newPaletteName.trim()) return;
    const name = newPaletteName.trim();
    const newId = createPalette(name);
    setActivePalette(newId);
    if (onCreated) {
      onCreated(newId);
    }
    setNewPaletteName("");
    bottomSheetRef.current?.close();
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: theme.background }}
      handleIndicatorStyle={{ backgroundColor: theme.border }}
      snapPoints={useMemo(() => ["40%"], [])}
      index={-1}
    >
      <BottomSheetView style={styles.content}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <ThemedText type="title" style={styles.headerTitle}>
            {t("palettes.createNew")}
          </ThemedText>
          <TouchableOpacity
            onPress={() => bottomSheetRef.current?.close()}
            style={styles.closeButton}
          >
            <IconSymbol name="xmark.circle.fill" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <BottomSheetScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + Spacing.lg },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.createForm, { borderColor: theme.border }]}>
            <TextInput
              style={[
                styles.nameInput,
                { color: theme.text, borderColor: theme.border },
              ]}
              placeholder={t("palettes.paletteName")}
              placeholderTextColor={theme.textSecondary}
              value={newPaletteName}
              onChangeText={setNewPaletteName}
              autoFocus
            />
            <View style={styles.createFormActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: theme.border }]}
                onPress={() => {
                  setNewPaletteName("");
                  bottomSheetRef.current?.close();
                }}
              >
                <ThemedText style={styles.cancelButtonText}>
                  {t("common.cancel")}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.createConfirmButton,
                  {
                    backgroundColor: newPaletteName.trim()
                      ? theme.tint
                      : theme.border,
                  },
                ]}
                onPress={handleCreatePalette}
                disabled={!newPaletteName.trim()}
              >
                <ThemedText
                  style={[
                    styles.createConfirmButtonText,
                    {
                      color: newPaletteName.trim()
                        ? "#FFFFFF"
                        : theme.textSecondary,
                    },
                  ]}
                >
                  {t("common.create")}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
});

PaletteCreator.displayName = "PaletteCreator";

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  createForm: {
    margin: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
  nameInput: {
    fontSize: Typography.fontSize.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  createFormActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  cancelButton: {
    flex: 1,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: Typography.fontSize.md,
  },
  createConfirmButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  createConfirmButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
});

