# SprayDeck

A spray paint color catalog, palette builder, and wall simulator for street artists and graffiti writers.

Built with React Native / Expo. Android only, offline-first, free.

## Getting started

```bash
npm install
npm run android   # Android emulator
npm start         # Expo dev server
```

## Commands

```bash
npm run lint        # ESLint
npm run type-check  # TypeScript check
npm run check       # Both (run before committing)
npm run prebuild    # Expo prebuild (clean)
npm run clean       # Full clean (node_modules, .expo, ios, android)
```

## Deployment

```
dev branch  →  preview APK build (EAS)
main branch →  production AAB → Play Store internal track → OTA update
```

Merging to `main` is the only step needed — EAS handles the build, submission, and OTA update automatically. To release publicly, promote the build from the internal track in Google Play Console.

Every push runs lint and type-check via GitHub Actions before anything gets built.

## Docs

See the [`docs/`](./docs/README.md) directory for vision, design system, product map, and launch checklist.
