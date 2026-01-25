## 🟢 Phase 0 — Project Foundation

### Objective

Create a clean, scalable Expo + React Native base.

### Deliverables

* Expo app (TypeScript)
* Folder structure
* Navigation
* Global state setup
* Design tokens

### Tasks

* Initialize Expo (managed)
* Configure TypeScript
* Setup React Navigation (bottom tabs)
* Setup state management (Zustand recommended)
* Create basic theme (colors, spacing)
* Empty placeholder screens

### Validation

* App runs on iOS & Android
* Tabs visible
* No business logic yet

---

## 🟢 Phase 1 — Color System (Core Data Layer)

### Objective

Implement the **spray color data model** and browsing.

### Deliverables

* Spray brand data (local JSON)
* Palette grid UI
* Color detail view
* Add/remove color to cart

### Tasks

* Define `SprayColor` model
* Load local color datasets
* Palette grid component
* Color detail modal
* Cart store (global)

### Validation

* User can browse colors
* User can add/remove colors
* Cart persists during session

---

## 🟢 Phase 2 — Color Cart (Creative Planning)

### Objective

Turn the cart into a **real creative tool**.

### Deliverables

* Cart screen
* Reorder colors
* Cross-brand support
* Save palette to project (local)

### Tasks

* Cart UI with swatches
* Drag & drop reordering
* Remove / clear actions
* Persist cart to local storage

### Validation

* Cart behaves like a palette builder
* Order matters
* Data persists on app restart

---

## 🟢 Phase 3 — Projects (Glue Layer)

### Objective

Create a container to connect colors, sketches, and walls.

### Deliverables

* Project model
* Project list
* Create/edit project
* Attach color cart

### Tasks

* Define `Project` type
* Create project CRUD
* Link cart to project
* Local persistence

### Validation

* Multiple projects
* Each project keeps its own palette

### Prompt

---

## 🟢 Phase 4 — Sketch Capture & Import

### Objective

Allow sketch input (no AI yet).

### Deliverables

* Camera/gallery import
* Sketch preview
* Attach sketch to project

### Tasks

* Expo Camera integration
* Image picker fallback
* Store image URI
* Display sketch inside project

### Validation

* User can capture or import sketch
* Sketch persists

---

## 🟢 Phase 5 — Wall Photo Capture

### Objective

Capture the real wall image.

### Deliverables

* Wall photo capture
* Attach to project
* Preview

### Tasks

* Camera screen for wall
* Save image
* Display in project

### Validation

* Wall image saved and reusable

---

## 🟢 Phase 6 — Wall Overlay (CORE FEATURE)

### Objective

Overlay sketch on wall with gestures.

### Deliverables

* Overlay renderer
* Opacity control
* Scale / move / rotate
* Save overlay state

### Tasks

* Image compositing
* Gesture handlers
* Opacity slider
* Persist transform matrix

### Validation

* Sketch aligns correctly
* Gestures feel natural

---

## 🟢 Phase 7 — Measurement & Planning Tools

### Objective

Help calculate real-world dimensions.

### Deliverables

* Reference point input
* Grid overlay
* Dimension estimation

### Tasks

* Tap to define reference
* Scale conversion logic
* Grid toggle

### Validation

* Approximate measurements work

---

## 🟢 Phase 8 — Sketch → Color Matching (AI)

### Objective

Introduce AI color extraction.

### Deliverables

* Dominant color extraction
* Spray color matching
* Add suggestions to cart

### Tasks

* Image color sampling
* Color clustering
* Nearest spray color matching
* UI for suggestions

### Validation

* Suggested colors make sense
* User can accept/reject

---

## 🟢 Phase 9 — Polish & UX

### Objective

Make it feel pro.

### Deliverables

* Performance optimizations
* Outdoor contrast mode
* Error handling
* Onboarding

### Tasks

* Gesture tuning
* Loading states
* Empty states
* Simple onboarding

### Validation

* App feels fast and stable

---

## 🔚 Phase 10 — Pre-Launch

### Objective

Prepare for release.

### Deliverables

* App icon
* Splash screen
* App Store copy
* Build profiles
