# Launch

> Pre-launch work before publishing SprayDeck to Google Play.
> Solo dev / spare time project — Android only, free app, no backend, no paid services.

---

## Blockers — store submission will fail without these

### Privacy Policy
Google Play requires a publicly accessible privacy policy URL even for offline apps.
- Content is simple: no data collected, no backend, local storage only
- Free hosting: GitHub Pages (static HTML), or a public Notion page
- Add the URL to Google Play Console under "App content"

### App Icon & Splash Screen
- Adaptive icon for Android: foreground layer + background layer (configured in `app.json` → `android.adaptiveIcon`)
- Splash screen consistent with the Neon Architect design system
- Reference: [DESIGN.md](./DESIGN.md) for colors and typography

### Store Metadata
- App name, short description (80 chars), full description
- Languages: EN + ES at minimum (match supported locales)
- At least 2 screenshots for Android phone (4–8 recommended)
- Category: Art & Design

### ⚠️ Loop Colors — empty brand in catalog
Loop Colors appears in `assets/data/brands.json` but has no series and no colors. Shipping this means users can navigate to a brand that shows nothing.
- **Option A (recommended):** add at least one Loop series with color data before launch
- **Option B:** remove Loop from `brands.json` until the data is ready
- Do not ship with the current state

---

## High Priority — ship blockers from a UX perspective

### Onboarding / First-Run Flow
New users land on an empty Home with no context. Add a lightweight intro:
- 2–3 screens: catalog → palette builder → wall simulator
- Shown only on first launch, skippable
- Final CTA: "Set your artist tag" → navigates to Profile

### Artist Tag Prompt
The Home greeting is personalized by the aka in Profile, but nothing prompts first-time users to set it. Add a nudge on first launch or in the Home empty state.

### Catalog — Montana Vice completeness
Montana Vice has only 50 colors — verify this is the full range or expand before launch.

### In-App Review Prompt
Critical for Play Store ranking and visibility.
- Package: `expo-store-review`
- Trigger: after the user saves their second palette or exports a doodle
- Never prompt on first launch or after an error

---

## Support the Developer — Profile Screen

Add a small "About & Support" section at the bottom of the Profile tab. Users who reach Profile are already engaged — this is the right place.

**Content:**
- One short paragraph: solo dev, spare time, passion project for the graffiti community
- "Support the project" button → Ko-fi link (opens in browser via `Linking.openURL`)
  - Ko-fi preferred over Patreon: lower friction, one-time donations, no platform fee
- Optional: link to a feedback form (Google Forms, free)

**Implementation:**
- Store the URL in `constants/links.ts`
- Add i18n keys for the section title, paragraph, and button label in all 5 locales
- Tone: personal and low-pressure

---

## Analytics — PostHog

**Tool: [PostHog](https://posthog.com)**
- Open source (MIT)
- Free cloud tier: 1M events/month, no credit card required
- React Native SDK: `posthog-react-native`
- No server required — events go directly to PostHog Cloud
- Includes funnels, retention, session analysis

**Setup:**
- Initialize `PostHogProvider` in `app/_layout.tsx`
- Generate a random anonymous ID once on first launch, persist in AsyncStorage
- Never collect personal data — no names, emails, or device identifiers
- Add to Privacy Policy: "Anonymous usage analytics collected via PostHog. No personal data is stored."

### KPIs to track

| KPI | Event | Why |
|---|---|---|
| DAU / MAU | App open | Core health |
| D1 / D7 retention | Second session within 1 / 7 days | Do users come back? |
| Onboarding completion rate | Step 1 → 2 → done | First-run drop-off |
| Palette created | `palette_created` | Core feature adoption |
| Photo import used | `palette_imported` | Differentiator usage |
| Doodle created | `doodle_created` | Core feature adoption |
| Doodle exported | `doodle_exported` | High-intent signal |
| Color detail opened | `color_detail_opened` | Catalog engagement |
| Cross-brand match viewed | `similar_colors_viewed {type: cross_brand}` | LAB feature usage |
| Support link tapped | `support_link_tapped` | Ko-fi conversion |
| Language changed | `language_changed` | Locale prioritization |
| Series favorited | `series_favorited` | Catalog engagement |

---

## Crash Reporting — Sentry

Without crash reporting you'll be blind to post-launch issues.
- Package: `@sentry/react-native` + `sentry-expo`
- Free tier: 5,000 errors/month
- Alternative: PostHog can capture exceptions too, keeping the tool count at one

---

## Medium Priority — polish before launch

### Accessibility Pass
- All interactive elements must have `accessibilityLabel`
- Test with large font sizes — especially color codes and swatch labels
- Minimum touch target: 44pt (defined in `constants/theme.ts`, verify enforcement across all new components)

### Palette Sharing / Export
Doodles export as PNG but palettes can't be shared. Artists show color plans to collaborators.
- "Share as image" action on palette detail
- Render swatches + name via `react-native-view-shot` → native share sheet

---

## Launch Readiness

| # | Area | Priority | Status |
|---|---|---|---|
| 1 | Loop Colors — fix or remove empty brand | Blocker | ✅ Done (200 colors, series wired up) |
| 2 | Montana Vice completeness audit | Blocker | ✅ Done (50 colors is the full range) |
| 3 | App icon / splash screen | Blocker | ✅ Done (adaptive icon + splash configured in app.json) |
| 4 | Privacy policy (hosted URL) | Blocker | ✅ Done (https://rubenglez.github.io/spraydeck-privacy/) |
| 5 | Store metadata + screenshots | Blocker | ⬜ Not started |
| 6 | Onboarding flow (first-run) | High | ✅ Done |
| 7 | Artist tag prompt (first-launch nudge) | High | ✅ Done |
| 8 | In-app review prompt | High | ✅ Done |
| 9 | About & Support section — Profile (Ko-fi) | Medium | ✅ Done |
| 10 | Analytics — PostHog | Medium | ✅ Done |
| 11 | Crash reporting — Sentry (or PostHog) | Medium | ✅ Done (PostHog global error handler) |
| 12 | Palette sharing / export | Medium | ⬜ Not started |
| 13 | Accessibility pass | Medium | ⬜ Partial (incomplete coverage) |
| 14 | Ironlak brand — add to PRODUCT.md, verify catalog wiring | Low | ⬜ Not started |
