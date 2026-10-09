---
name: Industrial Precision
colors:
  surface: '#F6F8F9'
  surface-dim: '#cfdce5'
  surface-bright: '#f5faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e9f5ff'
  surface-container: '#e3f0f9'
  surface-container-high: '#ddeaf4'
  surface-container-highest: '#d7e4ee'
  on-surface: '#111d24'
  on-surface-variant: '#41484c'
  inverse-surface: '#263239'
  inverse-on-surface: '#e6f3fc'
  outline: '#71787d'
  outline-variant: '#c0c7cc'
  surface-tint: '#30647b'
  primary: '#004257'
  on-primary: '#ffffff'
  primary-container: '#245a70'
  on-primary-container: '#9dd0e9'
  inverse-primary: '#9bcee7'
  secondary: '#51606a'
  on-secondary: '#ffffff'
  secondary-container: '#d5e5f1'
  on-secondary-container: '#576670'
  tertiary: '#5b330a'
  on-tertiary: '#ffffff'
  tertiary-container: '#764a20'
  on-tertiary-container: '#f9bc88'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bee9ff'
  primary-fixed-dim: '#9bcee7'
  on-primary-fixed: '#001f2a'
  on-primary-fixed-variant: '#114c62'
  secondary-fixed: '#d5e5f1'
  secondary-fixed-dim: '#b9c9d4'
  on-secondary-fixed: '#0e1d26'
  on-secondary-fixed-variant: '#3a4952'
  tertiary-fixed: '#ffdcc1'
  tertiary-fixed-dim: '#f7ba86'
  on-tertiary-fixed: '#2e1500'
  on-tertiary-fixed-variant: '#663d14'
  background: '#f5faff'
  on-background: '#111d24'
  surface-variant: '#d7e4ee'
  surface-elevated: '#FFFFFF'
  text-secondary: '#52616B'
  text-muted: '#61707A'
  border: '#DCE3E6'
  brand-on: '#FFFFFF'
  focus: '#145B9B'
  success: '#206B48'
  warning: '#8B5A15'
  danger: '#AF3540'
typography:
  headline-hero:
    fontFamily: Inter
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 62px
    letterSpacing: -0.025em
  headline-hero-mobile:
    fontFamily: Inter
    fontSize: 38px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-section:
    fontFamily: Inter
    fontSize: 34px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-section-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-card:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-default:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: 0em
  body-compact:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  button-text:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  ui-label:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.03em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2.5rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system expresses an industrial B2B aesthetic engineered for high-precision technical manufacturing, metal casting, and engineering procurement. It is characterized by absolute sobriety, functional legibility, structural order, and material authenticity. It eliminates all consumer-grade visual embellishments: no decorative gradients, no translucent frosted glass, no playful bouncy springs, and no generic stock photography.

The system communicates stability, uncompromising technical rigor, and industrial scale. The visual language blends Corporate/Modern discipline with utilitarian engineering layouts, establishing hierarchy through contrast, hairline borders, and strict spatial increments rather than superficial decorative layers. Every layout is calibrated for instant readability of complex technical specifications, dimensional drawings, and material datasheets.

## Colors

The chromatic architecture is divided between functional structural neutrals and a controlled deep teal-slate brand accent. The primary brand color (`#245A70`) provides an authoritative, industrial presence without consumer saturation.

Text contrast meets or exceeds WCAG 2.2 AA standards:
- Main text (`#18242B`) on pure white canvas achieves a contrast ratio greater than 13:1.
- Secondary copy (`#52616B`) remains above 4.8:1 for optimal legibility.
- Interactive states use high-visibility focus indicator rings in deliberate blue (`#145B9B`) with a mandatory minimum 2px offset.

When operating in dark mode (`[data-theme="dark"]`), surface tokens invert to high-density charcoal and slate tones:
- Background base shifts to `#11191E`, structural surface containers to `#1B272D`, and elevated floating overlays to `#25333A`.
- The brand accent transitions to an accessible, high-legibility light teal (`#88CBDD`) with dark inverted text (`#10232B`), ensuring interactive states remain distinct without causing halation or eye strain in low-light industrial environments.

## Typography

The typographic hierarchy utilizes `Inter` as a singular, robust variable font stack. The type scale is strictly controlled:
- Prose lines are capped at 65–72 characters per measure to prevent cognitive fatigue during technical reviews.
- Primary section headings use negative letter-spacing to tighten optical tracking at larger sizes.
- Tabular specs, product part numbers, technical tolerances, and metadata chips utilize `body-compact` and `ui-label` with tabular numeral alignment (`font-variant-numeric: tabular-nums`) to ensure strict vertical data scannability across columns.
- Font sizes below 12px are prohibited to guarantee baseline accessibility across field and warehouse tablets.

## Layout & Spacing

Layouts adhere to an 8px base grid rhythm (with a 4px half-step for precise control spacing). The maximum structural container width is hard-capped at 1200px, centering technical documentation and data views within comfortable ocular margins on high-resolution displays.

The grid framework adapts by breakpoint:
- **Mobile (< 768px):** 1-column stack with 20px outer margin, 12–16px element gaps, and section spacing of 56–80px.
- **Tablet (768px – 1023px):** 2–3 column configurations with 24–32px outer margin and 16–20px gutters.
- **Desktop (≥ 1024px):** 3–4 column configurations with 32–40px outer margins, 24px gutters, and section pacing of 80–112px.

All touchpoints enforce a strict 44×44px interactive bounding box for touch and pointer targets.

## Elevation & Depth

Visual hierarchy is established using flat tonal zoning and structural hairlines rather than diffused drop shadows. Pervasive box-shadows around content cards, tables, and standard modules are forbidden.

Depth is resolved through three functional planes:
1. **Base Floor:** Main application canvas (`--background`).
2. **Structural Container:** Recessed or distinct content blocks (`--surface`) separated by 1px solid hairline borders (`--border`).
3. **Elevated Overlays:** Popovers, dialogs, drawers, and context flyouts (`--surface-elevated`), using a 1px structural outline and a discrete ambient shadow (`0 8px 24px -4px rgba(24, 36, 43, 0.08)`) to maintain separation from the content plane. Scrim backdrops for modal dialogs use an accessible, restrained wash (`rgba(17, 25, 30, 0.5)`) without heavy optical distortion.

## Shapes

The geometry reflects industrial machine tooling: precise, controlled, and low-radius. Pill-shaped buttons and round corners are prohibited.

The token scale maps as follows:
- Controls, tags, badges, and interior form subcomponents utilize `--radius-sm` (6px).
- Standard product cards, inputs, drop-down selects, and interactive panels utilize `--radius-md` (10px).
- Modals, drawers, and high-level architectural overlays utilize `--radius-lg` (14px).
- Dividers and card borders use a uniform 1px solid hairline width.

## Components

### Buttons
- **Primary:** Background `--brand`, text `--brand-on`, border none, border-radius 8–10px, height 44–48px, horizontal padding 20–24px. Hover applies a subtle brightness shift with an instantaneous -1px vertical transform over 140ms (`cubic-bezier(0.2, 0.75, 0.25, 1)`).
- **Secondary / Outline:** Background transparent, text `--foreground`, 1px solid `--border`. Hover changes background to `--surface`.
- **Destructive:** Background `--danger`, text `#FFFFFF`.
- Fully rounded stadium or pill buttons are prohibited.

### Input Fields & Selects
- Constructed with `--surface-elevated` fill and a 1px solid `--border`.
- Height: 44px for standard inputs, 36px for dense data-entry grids. Corner radius: 10px.
- Focus state: Retains surface color, shifts border to `--focus`, and applies a 2px outer outline offset by 2px in `--focus` color. No floating labels; persistent field labels are positioned above the input using `ui-label`.

### Cards & Technical Modules
- Background `--surface` or `--surface-elevated` bounded strictly by a 1px solid `--border`.
- Flat geometry without drop shadows.
- Media components adhere to a 4:3 aspect ratio placed against uniform neutral backings.

### Badges & Chips
- Status indicators and spec pills use a 6px corner radius, height 24px, and horizontal padding 8px.
- Fills use 10% alpha tints of their respective semantic tokens (e.g., success badge: 10% `--success` background with 100% solid `--success` text).

### Data Tables & Spec Sheets
- Alternating subtle row backgrounds using `--surface` with a 1px hairline horizontal divider in `--border`.
- Numeric data columns use tabular figures and right-hand alignment.
- Row heights are standardized to 40px (compact) or 48px (standard).

### Modals & Drawers
- Elevated surface (`--surface-elevated`) with a 14px corner radius and 1px outline.
- Constrained by a strict backdrop scrim. Drawer slide-ins transition over 200ms using standard cubic bezier curves with no elastic bounce.