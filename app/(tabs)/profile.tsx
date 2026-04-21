import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Linking, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

import {
  LanguageSelectBottomSheet,
  type LanguageSelectBottomSheetRef,
} from "@/components/language-select-bottom-sheet";
import { Screen } from "@/components/screen";
import { ScreenHeader } from "@/components/screen-header";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Accent, BorderRadius, FontFamily, Spacing, Surface, Typography } from "@/constants/theme";
import { Links } from "@/constants/links";
import { useLanguageStore } from "@/stores/useLanguageStore";
import { useAnalytics } from "@/hooks/use-analytics";
import { useProfileStore } from "@/stores/useProfileStore";
import type { LanguageCode } from "@/types";

function SettingsRow({
  label,
  value,
  onPress,
  right,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.settingsRow, { opacity: pressed && onPress ? 0.7 : 1 }]}
      onPress={onPress}
    >
      <View style={styles.settingsRowText}>
        <ThemedText style={styles.settingsRowLabel}>{label}</ThemedText>
        {value && (
          <ThemedText style={styles.settingsRowValue}>{value}</ThemedText>
        )}
      </View>
      {right ?? (
        onPress && <IconSymbol name="chevron.right" size={16} color={Accent.onSurfaceMuted} />
      )}
    </Pressable>
  );
}

function SectionHeader({ label }: { label: string }) {
  return <ThemedText type="label" style={styles.sectionLabel}>{label}</ThemedText>;
}

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const aka = useProfileStore((s) => s.aka);
  const setAka = useProfileStore((s) => s.setAka);
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const languageSheetRef = useRef<LanguageSelectBottomSheetRef>(null);

  const currentLang = language ?? i18n.language.split("-")[0];
  const { captureLanguageChanged, captureSupportLinkTapped, captureIssueReportTapped } = useAnalytics();

  const handleSelectLanguage = (code: LanguageCode) => {
    setLanguage(code);
    i18n.changeLanguage(code);
    captureLanguageChanged(code);
    languageSheetRef.current?.dismiss();
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader title={t("tabs.profile")} />

        {/* Artist identity */}
        <View style={styles.section}>
          <SectionHeader label={t("profile.akaSection")} />
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.akaInput}
              placeholder={t("profile.akaPlaceholder")}
              placeholderTextColor={Accent.onSurfaceMuted}
              value={aka}
              onChangeText={setAka}
              autoCapitalize="words"
              autoCorrect={false}
              selectionColor={Accent.primary}
            />
          </View>
          <ThemedText style={styles.hint}>{t("profile.akaHint")}</ThemedText>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <SectionHeader label={t("profile.language")} />
          <View style={styles.card}>
            <SettingsRow
              label={t("profile.language")}
              value={t(`profile.lang_${currentLang}` as const)}
              onPress={() => languageSheetRef.current?.present()}
            />
          </View>
        </View>

        <LanguageSelectBottomSheet
          ref={languageSheetRef}
          currentLanguage={currentLang}
          onSelectLanguage={handleSelectLanguage}
        />

        {/* App info */}
        <View style={styles.section}>
          <SectionHeader label="App" />
          <View style={styles.card}>
            <SettingsRow
              label="Theme"
              value="Dark (Obsidian)"
              right={
                <View style={styles.themeDot} />
              }
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <SectionHeader label={t("profile.supportSection")} />
          <Pressable
            style={({ pressed }) => [styles.supportCard, { opacity: pressed ? 0.85 : 1 }]}
            onPress={() => {
              captureSupportLinkTapped();
              Linking.openURL(Links.kofi);
            }}
            accessibilityLabel={t("profile.supportButton")}
            accessibilityRole="button"
          >
            <View style={styles.supportGlow} />
            <ThemedText style={styles.supportTitle}>{t("profile.supportTitle")}</ThemedText>
            <ThemedText style={styles.supportBody}>{t("profile.supportBody")}</ThemedText>
            <View style={styles.supportButton}>
              <ThemedText style={styles.supportButtonText}>{t("profile.supportButton")}</ThemedText>
            </View>
          </Pressable>
        </View>

        {/* Feedback */}
        <View style={styles.section}>
          <SectionHeader label={t("profile.feedbackSection")} />
          <View style={styles.card}>
            <SettingsRow
              label={t("profile.reportIssue")}
              onPress={() => {
                captureIssueReportTapped();
                Linking.openURL(Links.githubIssues);
              }}
            />
          </View>
        </View>

        <ThemedText style={styles.version}>SprayDeck · For the streets</ThemedText>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionLabel: {
    paddingHorizontal: Spacing.xs,
  },
  card: {
    backgroundColor: Surface.base,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    minHeight: 52,
  },
  settingsRowText: {
    flex: 1,
    gap: 1,
  },
  settingsRowLabel: {
    fontSize: Typography.fontSize.md,
    color: Accent.onSurface,
  },
  settingsRowValue: {
    fontSize: Typography.fontSize.sm,
    color: Accent.onSurfaceMuted,
  },
  inputWrap: {
    backgroundColor: Surface.highest,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  akaInput: {
    height: 52,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: Accent.onSurface,
    fontFamily: FontFamily.displayMedium,
  },
  hint: {
    fontSize: Typography.fontSize.sm,
    color: Accent.onSurfaceMuted,
    paddingHorizontal: Spacing.xs,
  },
  themeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Accent.primary,
  },
  version: {
    fontSize: Typography.fontSize.xs,
    color: Accent.onSurfaceMuted,
    textAlign: "center",
    paddingTop: Spacing.md,
  },
  supportCard: {
    backgroundColor: Surface.high,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: `${Accent.primary}30`,
    overflow: "hidden",
  },
  supportGlow: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${Accent.primary}12`,
  },
  supportTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: FontFamily.displayBold,
    color: Accent.primary,
  },
  supportBody: {
    fontSize: Typography.fontSize.sm,
    color: Accent.onSurfaceMuted,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.relaxed,
  },
  supportButton: {
    marginTop: Spacing.xs,
    backgroundColor: Accent.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
  },
  supportButtonText: {
    fontSize: Typography.fontSize.md,
    fontFamily: FontFamily.displaySemiBold,
    color: Accent.onPrimary,
  },
});
