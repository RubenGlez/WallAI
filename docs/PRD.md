# 📄 PRD – WallAI 

## 1. Product Overview

**Product Name:** WallAI
**Tagline:** From sketch to wall, guided by AI

**Description:**
WallAI is a mobile AI assistant for graffiti artists that helps plan graffiti pieces in real-world conditions by combining:

* Real spray color palettes
* AI-assisted color matching from sketches
* Wall overlay tools to accurately place, scale, and trace designs on real walls

---

## 2. Product Pillars (MVP)

### Pillar 1 – Color System (Palettes + Cart)

**Single unified system**, two views:

* **Palette View** → browse colors
* **Cart View** → build combinations

---

## 3. Core Features

---

## 3.1 🎨 Color System (Spray Palettes + Color Cart)

### Description

A unified color system that lets users browse real spray colors and collect them into a “cart” to experiment with combinations.

This is a **creative planning tool**, not a store.

---

### Functional Scope

#### Palette View

* Browse spray brands
* Visual grid of colors
* Search by name / code
* Filter by brand
* Tap color → details
* Add color to cart

#### Cart View

* Selected colors across brands
* Drag to reorder
* Remove colors
* Visual palette preview
* Save palette to project

---

### Core Use Cases

* Build a color combo before painting
* Compare similar colors across brands
* Prepare a final spray list
* Use palette inside wall overlay mode

---

### Data Model (Simplified)

```json
{
  "id": "color_001",
  "brand": "Montana Black",
  "name": "Power Pink",
  "code": "BLK3120",
  "hex": "#E63C8F"
}
```

---

## 3.2 🧠 Sketch → Spray Color Matching

### Description

Analyze a photo of a sketch and map its dominant colors to real spray colors.

---

### User Flow

1. Take photo of sketch
2. App extracts dominant colors
3. User selects preferred brand(s)
4. App suggests closest spray matches
5. User confirms / edits
6. Colors are added to **Color Cart**

---

### Functional Requirements

* Extract 5–12 dominant colors
* Color distance matching (RGB / LAB)
* Manual override
* One-tap “Add all to cart”

---

## 3.3 🧱 Wall Overlay & Measurement (CORE FEATURE)

### Description

Allows users to take a photo of a wall and overlay their sketch on top to guide **positioning, scale, and proportions** before and during painting.

This is a **key differentiator** of WallAI.

---

### User Flow

1. User enters **Wall Mode**
2. Takes photo of wall (or uses live camera)
3. Selects sketch (photo or project sketch)
4. Sketch appears as semi-transparent overlay
5. User adjusts overlay
6. User locks overlay and uses it as a guide

---

### Overlay Controls

* Opacity slider
* Scale (pinch)
* Rotate
* Drag to move
* Flip (optional)

---

### Measurement & Planning Tools

* Reference points (tap-to-measure)
* Aspect ratio lock
* Grid overlay
* Estimated dimensions (based on reference input)

  * e.g. “This door is 2m high”

> User provides **one real-world reference** to scale the entire sketch.

---

### Functional Requirements

* Image overlay rendering
* Gesture-based transformations
* Save reference image
* Attach overlay setup to project

---

### Nice-to-have (Post-MVP)

* AR anchoring
* Perspective correction
* Symmetry guides
* Outline-only mode

---

## 3.4 📁 Projects

### Description

Local project container tying everything together.

---

### Each Project Includes

* Name
* Sketch image
* Color Cart (palette)
* Wall photo
* Overlay configuration
* Notes

---

## 4. Navigation Structure

Bottom Tabs:

* **Home**
* **Colors** (Palette + Cart)
* **Scan**
* **Wall**
* **Projects**

Color Cart is accessible globally.

---

## 5. UX Principles

* Designed for outdoor use
* High contrast
* One-hand interaction
* Minimal text
* Fast access to camera

---

## 6. Non-Goals (MVP)

* No social network
* No accounts
* No buying sprays
* No tutorials
