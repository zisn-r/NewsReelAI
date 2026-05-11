---
name: Newsreel AI
description: Cinematic, source-cited news videos for professionals.
colors:
  primary: "#6366f1"
  primary-light: "#818cf8"
  background: "#0a0a12"
  surface: "#13131f"
  surface-light: "#1e1e2e"
  border: "#2a2a3d"
  text: "#e8e8f0"
  muted: "#9ca3af"
  success: "#34d399"
  error: "#f87171"
typography:
  display:
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  body:
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  full: "9999px"
spacing:
  xs: "0.5rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "2rem"
  xl: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "1rem 1.5rem"
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "1rem 1.25rem"
---

# Design System: Newsreel AI

## 1. Overview

**Creative North Star: "The Fact Sheet Architecture"**

Newsreel AI utilizes a high-signal, low-noise aesthetic designed for the "on-the-go" professional. The system rejects the "magical AI" tropes of glowing gradients and wavy sparks in favor of surgical precision and radical transparency. Every element is built to convey trust and structural integrity.

**Key Characteristics:**
- High-contrast legibility for rapid information absorption.
- Monochromatic structural base with a single authoritative indigo accent.
- Strictly flat surfaces with 1px borders; no glassmorphism or "glow up" effects.
- Direct, descriptive system feedback during asynchronous generation.

## 2. Colors

The "Technical Slate" palette provides a stable, professional foundation for news consumption.

### Primary
- **Indigo Authority** (#6366f1): Used exclusively for primary actions and critical highlights. Its rarity ensures its impact.

### Neutral
- **Deep Midnight** (#0a0a12): The primary canvas.
- **Surface Slate** (#13131f): Used for distinct content modules and containers.
- **Ghost White** (#e8e8f0): High-contrast text for maximum readability.
- **Industrial Border** (#2a2a3d): Structural 1px division between surfaces.

### Named Rules
**The Accented Rarity Rule.** The primary indigo accent is used on ≤10% of any given screen. If the interface feels "purple," the rule is being broken.

## 3. Typography

**Display Font:** Geist Sans (Bold)
**Body Font:** Geist Sans (Regular)

**Character:** Technical and neutral. Geist’s geometric precision supports the "Fact Sheet" metaphor by feeling engineered rather than decorated.

### Hierarchy
- **Display** (Bold, 3.75rem, 1.1): Used for the main headline on the landing page.
- **Headline** (Bold, 1.875rem, 1.2): Section headings and video titles.
- **Body** (Regular, 1.125rem, 1.6): Primary reading text. Max line length: 65ch.
- **Label** (Medium, 0.75rem, 1.4, Uppercase): Meta-data and source labels.

## 4. Elevation

The system is **Strictly Flat (High Minimal)**. It rejects shadows and blurs to maintain a "printed sheet" clarity.

### Named Rules
**The Zero-Shadow Rule.** Depth is conveyed through 1px border contrast and tonal shifts in surface color (`#0a0a12` vs `#13131f`), never through box-shadows or blurs.

## 5. Components

### Buttons
- **Shape:** Large radius (1rem) but strictly flat.
- **Primary:** Indigo Authority background with white text.
- **Interaction:** Transition to `{colors.primary-light}` on hover; subtle scale reduction (0.98) on active state to provide tactile feedback without glow.

### Inputs
- **Style:** 1px `border-border` on a `surface` background.
- **Focus:** Border shift to `primary` indigo. No external glow rings.

### Sources Card
- **Style:** Surface background with a crisp 1px border.
- **Layout:** Vertical list of sources with 1px dividers between items.

## 6. Do's and Don'ts

### Do:
- **Do** use exact 1px borders (`#2a2a3d`) for all container divisions.
- **Do** ensure every video is paired with high-contrast, labeled sources.
- **Do** use solid, steady progress bars for loading states.

### Don't:
- **Don't** use gradients, neon palettes, or glassmorphism (per PRODUCT.md anti-references).
- **Don't** use emojis in the UI or news copy.
- **Don't** use status dots or animated pulse effects for loading; use descriptive text.
- **Don't** wrap everything in cards. Use whitespace and 1px lines to define structure.
