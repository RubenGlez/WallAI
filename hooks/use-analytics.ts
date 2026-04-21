import { usePostHog } from 'posthog-react-native';

export function useAnalytics() {
  const posthog = usePostHog();

  return {
    captureOnboardingCompleted: () =>
      posthog?.capture('onboarding_completed'),

    captureOnboardingSkipped: (lastSlide: number) =>
      posthog?.capture('onboarding_skipped', { last_slide: lastSlide }),

    capturePaletteCreated: (colorCount: number) =>
      posthog?.capture('palette_created', { color_count: colorCount }),

    capturePaletteImported: (colorCount: number) =>
      posthog?.capture('palette_imported', { color_count: colorCount }),

    captureDoodleCreated: () =>
      posthog?.capture('doodle_created'),

    captureDoodleExported: () =>
      posthog?.capture('doodle_exported'),

    captureColorDetailOpened: (seriesId: string) =>
      posthog?.capture('color_detail_opened', { series_id: seriesId }),

    captureLanguageChanged: (language: string) =>
      posthog?.capture('language_changed', { language }),

    captureSeriesFavorited: (seriesId: string) =>
      posthog?.capture('series_favorited', { series_id: seriesId }),

    captureSupportLinkTapped: () =>
      posthog?.capture('support_link_tapped'),

    captureIssueReportTapped: () =>
      posthog?.capture('issue_report_tapped'),
  };
}
