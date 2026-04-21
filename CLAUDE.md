# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this app is

SprayDeck is a React Native/Expo mobile app for street artists and graffiti writers. It provides a spray paint color catalog, palette builder, and a doodle/wall simulator for planning pieces.

## Commands

```bash
npm start               # Expo dev server
npm run ios             # iOS simulator
npm run android         # Android emulator
npm run lint            # ESLint
npm run type-check      # TypeScript check
npm run check           # Both type-check and lint (run before committing)
npm run prebuild        # Expo prebuild (clean)
npm run clean           # Full clean (node_modules, .expo, ios, android)
npm run build:preview   # EAS build — Android APK for device testing
npm run build:production # EAS build — Android AAB for Play Store
npm run submit:production # EAS submit — upload AAB to Google Play
```

No test framework is configured.

## Architecture

### Navigation (expo-router, file-based)

```
app/
├── _layout.tsx           # Root: GestureHandler → SafeArea → BottomSheetModal → ThemeProvider
├── (tabs)/               # Bottom tab navigator (home, catalog, palettes, doodles, profile)
├── color-grid/[seriesId] # Series color detail grid
├── palettes/create       # Manual palette builder
├── palettes/import       # Image → color extraction → brand matching
└── doodles/create        # Wall simulator (wall + sketch overlay with transforms)
```

### State management (Zustand + AsyncStorage)

All user data lives in Zustand stores with `persist()` middleware:

| Store               | Key                   | Purpose                                                   |
| ------------------- | --------------------- | --------------------------------------------------------- |
| `useCatalogStore`   | in-memory             | Static brand/series/color JSON, pure functions — no hooks |
| `usePalettesStore`  | `spraydeck-palettes`  | User palettes CRUD                                        |
| `useFavoritesStore` | `spraydeck-favorites` | Favorited colors, brands, series                          |
| `useDoodlesStore`   | `spraydeck-doodles`   | Doodle projects (wall/sketch images + transforms)         |
| `useProfileStore`   | `spraydeck-profile`   | Artist name (aka)                                         |
| `useLanguageStore`  | `spraydeck-language`  | Selected language                                         |
| `useThemeStore`     | `spraydeck-theme`     | Theme store (exists but unused — app is dark-only)        |

`useCatalogStore` is different: it loads static JSON directly (no AsyncStorage). Colors are lazy-loaded per series via `colorsBySeriesId`.

### Color matching

`/lib/colorMatch.ts` — LAB color space similarity for "closest match" across brands. Colors need LAB values (precomputed via `npm run colors:add-lab`). The catalog JSON files live in `/data/`.

### Key directories

- `/components/` — Reusable UI (cards, bottom sheets, modals, toolbar)
- `/components/ui/` — Primitives (`IconSymbol` with iOS/Android variants)
- `/hooks/` — Custom hooks; `.web.ts` variants override for web
- `/lib/` — Pure functions (color matching, display names, ID generation)
- `/stores/` — Zustand stores
- `/constants/` — Design tokens (`theme.ts`), grid layout math (`color-grid.ts`)
- `/types/index.ts` — Central types: `Brand`, `Series`, `Color`, `Palette`, `Doodle`
- `/locales/` — i18n JSON (en, es, de, fr, pt); default language is Spanish

### Doodle editor

The most complex screen (~900 LOC at `app/doodles/create.tsx`). It uses:

- Two-layer system: wall (background) + sketch (overlay)
- `react-native-reanimated` `SharedValue` for pan/pinch/rotate/flip/opacity
- `react-native-view-shot` to export the composite as PNG

### Localization

i18next with dot-notation keys (`tabs.home`, `catalog.searchPlaceholder`). Use `t("key", { interpolation })` for dynamic values. All user-visible strings must be in `/locales/*.json`.

### Design system

The app uses the "High-Utility Obsidian" dark theme exclusively (see `docs/DESIGN.md`). Light mode is deferred. Key rules:

- **Dark-only**: `_layout.tsx` forces `DarkTheme`; never use `useColorScheme` or `useTheme` — import `Accent` and `Surface` tokens directly from `constants/theme.ts`
- **No borders**: depth is expressed through `Surface` color shifts (`lowest` → `bright`), not `borderWidth`
- **Fonts**: Space Grotesk (`FontFamily.displayBold/SemiBold/Medium`) for titles/labels; system font for body text
- **Border radius**: `BorderRadius.full` (9999) for all interactive elements

## Conventions

- **Zustand stores** named `useXxxStore`; pure catalog functions named `getXxx`/`filterXxx`
- **Bottom sheets** export a ref type (e.g. `ColorDetailBottomSheetRef`) and are opened imperatively
- **Screen params** typed with `useLocalSearchParams<{ seriesId: string }>()`
- **Touch targets** minimum 44pt (enforced in `constants/theme.ts`)
- **useMemo** for filtered/computed lists; avoid re-renders from selection state with refs
- **No backend** — everything is local AsyncStorage; no auth, no network calls

## Build configuration notes

- New Architecture enabled (`newArchEnabled: true`)
- React Compiler enabled (`experiments.reactCompiler: true`) — avoid manual `useMemo`/`useCallback` where the compiler handles it
- Typed Routes enabled (`experiments.typedRoutes: true`) — route strings are type-checked
