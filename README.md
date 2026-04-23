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

## CI/CD

### CI checks (GitHub Actions)

- Workflow: `.github/workflows/ci.yml`
- Triggers: `push` and `pull_request` on `main` and `dev`
- Runs:
  - `npm ci`
  - `npm run check` (type-check + lint)

### EAS workflows

#### Main branch (`main`) — preview OTA only

- Workflow: `.eas/workflows/main-preview-update.yml`
- Trigger: push to `main`
- Action: publish OTA update to the `preview` channel
- No Play Store submission happens on `main` pushes

#### Production releases (`v*` tags or manual dispatch)

- Workflow: `.eas/workflows/create-production-builds.yml`
- Triggers:
  - Push tag matching `v*`
  - Manual `workflow_dispatch`
- Strategy:
  1. Calculate Android fingerprint.
  2. Find an existing `production` build with the same fingerprint.
  3. If a build exists: publish a `production` OTA update and skip rebuild/resubmit.
  4. If no build exists:
     - Build Android with `profile: production`.
     - Submit with `profile: production` (Play production track).
     - Publish `production` OTA update only after submit succeeds.

### Runtime compatibility

`app.json` uses:

```json
"runtimeVersion": { "policy": "fingerprint" }
```

This keeps OTA updates aligned with native runtime compatibility automatically.

### Release flow

1. Merge to `main` to ship preview OTA updates.
2. Create/push a version tag (for example, `v1.2.3`) to run a production release.
3. Optionally run production release manually:

```bash
eas workflow:run create-production-builds.yml
```

## Docs

See the [`docs/`](./docs/README.md) directory for vision, design system, product map, and launch checklist.
