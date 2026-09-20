---
name: Fleet Command & Logistics System
colors:
  surface: '#0f131c'
  surface-dim: '#0f131c'
  surface-bright: '#353943'
  surface-container-lowest: '#0a0e17'
  surface-container-low: '#181b25'
  surface-container: '#1c1f29'
  surface-container-high: '#262a34'
  surface-container-highest: '#31353f'
  on-surface: '#dfe2ef'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dfe2ef'
  inverse-on-surface: '#2c303a'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#ca8100'
  on-tertiary-container: '#3e2400'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0f131c'
  on-background: '#dfe2ef'
  surface-variant: '#31353f'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system delivers a high-precision, mission-critical mobile control hub engineered specifically for freight directors, transport operators, and modern fleet owners. The aesthetic borrows from the focused, utilitarian craft of modern developer utilities and executive command interfaces (Linear, Raycast, Vercel)—channeling it into commercial trucking logistics.

The brand persona is authoritative, analytical, and hyper-reliable. It strips away ornamental clutter in favor of high-legibility telemetry, status-first visual hierarchies, and instantaneous tap targets that function seamlessly whether an operator is reviewing assets in an executive office or roadside in high-glare conditions.

Key stylistic pillars:
- **Engineered Minimalism & Density:** Every pixel serves operational awareness. Data tables, status tags, and route cards use tight layouts without sacrificing touch ergonomic requirements (minimum 44x44px target bounds).
- **Subtle Glass & Deep Layering:** Translucent borders and surface elevations layer against near-black midnight backdrops, creating a focused, instrument-panel aesthetic.
- **Precision Semantics:** Color is strictly informational. Vibrant emeralds, amber radars, and high-urgency crimsons are reserved exclusively for asset health, compliance deadlines, and immediate physical dispatch events.

## Colors

The color palette is built strictly for native OLED depth and rapid status scanning. The canvas operates in pure dark mode, utilizing deep oceanic navy tones rather than standard zinc or neutral grays to preserve night vision and reduce eye fatigue during late-shift dispatching.

### Palette Architecture
- **Base Canvas (`#090D16`):** The foundational substrate for full-bleed mobile views and native system underlays.
- **Surface Deep (`#0D1322`):** Primary grouped background layer for lists, sheets, and full-width content groupings.
- **Surface Elevated (`#131B2E`):** Distinct card surfaces, floating action items, and bottom sheet containers.
- **Surface Interactive / Hover (`#1A243B`):** Pressed states, search fields, active tabs, and highlighted rows.
- **Primary Action (`#3B82F6` / `#2563EB`):** High-energy electric blue indicating primary user pathways, interactive links, route lines, and selected toggles.

### Telemetry & Operational Semantics
- **Active / Operational Emerald (`#10B981` / background tint `rgba(16, 185, 129, 0.12)`):** In-transit status, fully compliant vehicle inspections, active drivers, healthy telematics.
- **Expiry Radar Amber (`#F59E0B` / background tint `rgba(245, 158, 11, 0.12)`):** Impending maintenance, licenses or medical cards expiring in 1–2 days, low DEF/fuel levels.
- **Critical Urgency Crimson (`#EF4444` / background tint `rgba(239, 68, 68, 0.15)`):** Immediate out-of-service orders, DOT compliance violations, crash alerts, unassigned delayed loads.

### Monochromes & Text Tiers
- **Text Primary (`#FFFFFF`):** High-contrast display metrics, asset IDs, active titles.
- **Text Secondary (`#94A3B8`):** Subheads, metadata labels, odometer readings, structural timestamps.
- **Text Muted / Tertiary (`#64748B`):** Inactive icons, trailing units (e.g., `mi`, `hrs`), subtle helper prompts.
- **Border Subtle (`rgba(255, 255, 255, 0.08)`):** Micro-borders outlining elevated containers.

## Typography

Typography establishes strict order and technical clarity. The primary interface utilizes **Inter** for its neutral geometric chassis and optimized low-resolution legibility at dense scale. For specialized data telemetry—such as Vehicle Identification Numbers (VINs), unit identifiers (e.g., `TRK-8802`), coordinate paths, and odometer readings—**JetBrains Mono** is employed to guarantee fixed-character optical alignment.

### Usage Principles
- **Display Figures:** Numbers indicating active units or revenue load indicators are rendered with negative letter spacing (`-0.02em`) to maintain a clean, compact look.
- **Monospaced Telemetry:** All vehicle identifiers, license plates, fuel readouts, and timestamps rely on `label-md` or `label-sm` using JetBrains Mono. This prevents jumping visual baselines when values update in real-time.
- **Label Transformations:** Monospaced tags (such as `IN-TRANSIT` or `DOT-OUT`) always render uppercase with tracking (`letter-spacing: 0.04em`) to establish visual punch even at 11px.

## Layout & Spacing

The layout is built for native mobile devices (baseline target 390x844px), scaled systematically across iOS and Android screens. It adopts a strict 8-point base grid system (with 4px half-steps for micro-alignments such as badge padding and icon-to-label gaps).

### Screen Architecture
- **Safe Area Anchors:** Screen content respects a top safe margin (44–54px for status bar/Dynamic Island) and bottom clearance (minimum 34px on gesture-bar devices) above the native fixed navigation bar.
- **Horizontal Framing:** Standard edge margins conform to `margin` (16px / `1rem`). Full-width edge-to-edge list grouping uses inner card margins to preserve clean structural hierarchy.
- **Vertical Rhythm:** Content modules (e.g., Fleet Overview Cards, Compliance Alerts Stack, Driver Activity) are separated by `space-lg` (24px). Micro-stack items inside cards use `space-sm` (8px).
- **Minimum Tap Ergonomics:** All interactive buttons, filter pills, and bottom bar icons adhere strictly to a minimum touch bounding box of 44x44px, regardless of the visual surface size of the glyph or chip.

## Elevation & Depth

Visual hierarchy uses a refined combination of **tonal layering**, **specular edge lighting (glassmorphism borders)**, and **subtle ambient shadows**. Heavy drop shadows are omitted; instead, depth is created by moving closer to the light source through tint adjustments.

### Surface Tiers
1. **Tier 0 (Backdrop Canvas - `#090D16`):** The non-interactive base plane visible behind scrolling lists and edge margins.
2. **Tier 1 (Surface Deep - `#0D1322`):** Tab bar containers, persistent top headers, and inset list trays.
3. **Tier 2 (Elevated Component Surface - `#131B2E`):** Standard asset cards, driver detail panels, metric scorecards. Outlined with a single hairline border: `1px solid rgba(255, 255, 255, 0.08)`.
4. **Tier 3 (Floating Overlays & Modals - `#1A243B`):** Bottom sheets, popovers, and quick-action speed dials. Accompanied by an ambient shadow: `0 12px 32px -4px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.12)`.

### Specular Highlighting
To emulate high-end hardware, elevated cards incorporate a top-edge linear highlight (`linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0) 100%)`). This imparts a crisp, machined edge feel.

## Shapes

The design system employs a disciplined, balanced geometry (`roundedness: 2`). This keeps containers structural and serious, while providing soft pill shapes for status tags and tactile interactive affordances.

### Application Rules
- **Base Cards & Sheets:** Fixed at `16px` (`rounded-lg` / `1rem`) corner radius. This fits the bezel curve of modern iOS and Android chassis.
- **Inner Interactive Elements:** Text inputs, button groups, and map HUD controls use `8px` (`rounded` / `0.5rem`).
- **Telemetry Chips & Badges:** Use total pill rounding (`rounded-full` / `9999px`) to create an immediate visual contrast between rectangular data-dense containers and dynamic status states.
- **Divider Strokes:** 1px stroke weight, never extending outside the safe boundary of component padding.

## Components

### Buttons
- **Primary:** High-energy electric blue (`#3B82F6`) background, white (`#FFFFFF`) bold label, 8px corner radius. Minimum height 48px for primary execution paths (e.g., "Dispatch Load", "Sign Inspection"). Active state: `#2563EB`.
- **Secondary / Ghost Surface:** Background `#131B2E`, 1px border `rgba(255, 255, 255, 0.08)`, text `#FFFFFF`. Minimum height 44px. Active state: `#1A243B`.
- **Destructive:** Background `rgba(239, 68, 68, 0.12)`, border `1px solid rgba(239, 68, 68, 0.3)`, text `#EF4444`. Used for "Take Out of Service" or "Cancel Dispatch".

### Status Chips & Badges
- **Structure:** Pill-shaped (`rounded-full`), height 24px, horizontal padding 10px, vertical padding 2px.
- **Active / On Route:** Background `rgba(16, 185, 129, 0.12)`, border `1px solid rgba(16, 185, 129, 0.25)`, text `#10B981`. Includes a 6px pulsating green status dot at the left edge.
- **Expiry Radar (1–2 Days):** Background `rgba(245, 158, 11, 0.12)`, border `1px solid rgba(245, 158, 11, 0.25)`, text `#F59E0B`.
- **Critical Violation:** Background `rgba(239, 68, 68, 0.15)`, border `1px solid rgba(239, 68, 68, 0.3)`, text `#EF4444`.

### Fleet Cards
- Encased in `#131B2E` with a hairline `rgba(255, 255, 255, 0.08)` border and 16px radius.
- **Card Header:** Vehicle identifier (`JetBrains Mono`, white, 14px) and active status pill aligned horizontally.
- **Card Body:** Route path (e.g., `ORD ➔ ATL`) displayed in 16px Inter Semibold, accompanied by real-time ETA and fuel/DEF progress bars.
- **Micro Progress Bars:** Background `#0D1322`, 4px height, filled with primary blue or health status colors.

### Native Bottom Navigation Bar
- Frosted chrome container pinned to bottom: background `rgba(13, 19, 34, 0.85)` with `backdrop-filter: blur(20px)` and top border `1px solid rgba(255, 255, 255, 0.08)`.
- Height: 58px + safe area home indicator margin (34px).
- Four core destinations: **Fleet**, **Live Map**, **Compliance Radar**, **Settings**. Inactive items: `#64748B`; Active selection: `#3B82F6` with subtle blue glow dot under the icon.

### Form Inputs & Search
- Field height: 48px, background `#0D1322`, border `1px solid rgba(255, 255, 255, 0.08)`, corner radius 8px, text `#FFFFFF`, placeholder `#64748B`.
- Focus state: border shifts to `#3B82F6`, shadow `0 0 0 1px #3B82F6`. Trailing clear buttons and QR/barcode scanning shortcuts sized at 44x44px.

### Selection Controls (Checkboxes & Radios)
- Checkboxes: 20x20px square with 4px border radius. Unchecked: `1.5px solid #64748B` on `#0D1322`. Checked: background `#3B82F6` with a white checkmark icon.
- Toggle Switches (DVIR / Vehicle On/Off Duty): Track 48x28px in `#1A243B`, Thumb 24x24px white circle. Active track transitions to `#10B981` (Operational) or `#3B82F6`.