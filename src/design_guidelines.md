# Human Upgrade OS - Design Guidelines

## Brand Identity

**Brand Name:** Human Upgrade OS

**Tagline:** "Upgrade Your Biology"

**Logo Concept:**
- Stylized human figure composed of geometric shapes
- Circle (head), rounded rectangle (shoulders), red upward triangle (core/heart), two pill shapes (body/legs)
- Colors: White elements with red (#DC2626) accent triangle
- Style: Clean, minimalist, modern
- Text: "HUMAN UPGRADE" in uppercase, white, tight letter-spacing

## Design Aesthetic

**Inspiration:** Apple Health x WHOOP x Neuralink
- Futuristic biotech UI
- Premium high-end wellness brand
- Dark, sophisticated, data-driven

## Color Palette

### Landing Page (Pre-Auth)
| Role | Color |
|------|-------|
| Background | #0A0612 (Deep Black-Violet) |
| Gradient | #150F24 → #0A0612 |
| Accent Purple | #7C3AED |
| Primary Red | #DC2626 |
| Text Primary | #FFFFFF |
| Text Muted | rgba(255,255,255,0.5) |

### Dashboard (Post-Auth)
| Role | Color |
|------|-------|
| Background | #141414 (Dark Charcoal) |
| Card Background | #1e1e1e |
| Card Border | #333333 |
| Foreground | #fafafa (White) |
| Primary/Accent | #DC2626 (Red) |
| Muted Text | #a3a3a3 |
| Success | #22c55e (Green) |
| Warning | #eab308 (Yellow) |

## Typography

- **Headings:** Montserrat SemiBold, letter-spacing +2%
- **Body Text:** Inter Regular
- **Style:** Clean, minimal, no gradients on text
- Hierarchy: Use size and weight variations to establish clear information hierarchy

## Landing Page Elements

### Hero Section
- Large logo with pulsing neon ring animation
- Red/purple gradient glow behind logo
- Headline: "Upgrade Your Biology"
- Subtext: "One upload. Endless insights."
- Description: "The world's first AI engine that turns your bloodwork into a full optimization protocol."

### Animations
- **Particle Effects:** Floating red/purple particles across the page
- **DNA Helix:** Animated DNA strands on left and right sides (desktop only)
- **Neon Ring:** Pulsing ring around logo with gradient border
- **Glow Effects:** Purple/red glow on CTA buttons

### Feature Cards
1. **Engineered Peptide Protocols** (DNA icon)
   - Personalized dosing
   - Peptide stacks
   - Optimized cycling

2. **TRT & Hormone Optimization** (Activity icon)
   - Based on biomarkers
   - Personalized lifestyle adjustments
   - Continuous monitoring

3. **Full Supplement Stack Builder** (Pill icon)
   - AI-selected vitamins & minerals
   - Based on deficiencies
   - Optimized timing

4. **Morning → Evening Life Protocol** (Clock icon)
   - Sleep optimization
   - Hydration tracking
   - Light exposure & stress modulation

### CTA Buttons
- Primary: Red (#DC2626) with purple glow effect
- Secondary: Outline with white border
- Shape: rounded-full (pill shape)

## Component System

### Cards
- Border radius: 12px (rounded-lg)
- Border: 1px solid rgba(255,255,255,0.1)
- Background: rgba(255,255,255,0.02) with backdrop-blur
- Hover state: Subtle lift with hover-elevate class

### Buttons
**Primary (Red):**
- Background: #DC2626
- Text: White
- Shape: rounded-full
- Glow: 0 0 20px rgba(220, 38, 38, 0.4)

**Secondary/Outline:**
- Border: 1px solid rgba(255,255,255,0.2)
- Background: Transparent
- Text: White
- Hover: Subtle background elevation

### Badges
- Premium badge: Red background (#DC2626)
- Status badges: Green/Yellow/Red based on status
- Small size, rounded-full

## Dashboard Layout

**Top Bar:**
- Left: Logo with "HUMAN UPGRADE" text
- Right: "Upload PDF" (outline button) + "Generate Protocol" (red button) + User avatar

**Grid System:**
- 3-column responsive layout on desktop
- 2-column on tablet, 1-column on mobile
- Consistent gap spacing (gap-6)

**Dashboard Cards:**
1. Performance Age
2. Vital Energy Index
3. Neural Activation
4. Recovery Debt
5. Peptide Readiness (Premium)
6. Hormone Status
7. Metabolic Status
8. Inflammation
9. Morning Routine (Premium)
10. Evening Routine (Premium)
11. Supplement Protocol (Premium)
12. Workout Plan (Premium)
13. Risks & Alerts
14. Notes

## Pricing Page

**Layout:** 3-column card layout with comparison table

**Pricing Tiers:**
1. **Basic** ($39/mo) - Gray/muted accents
2. **Premium Monthly** ($49/mo) - Red accents, "Most Popular" badge
3. **Premium Annual** ($359/yr) - Red accents, "Save 39%" badge

## Trial Mode

**Trial Banner:**
- Background: brand-red/10 with border brand-red/20
- Shows countdown: "Free Trial: X days remaining"
- "Upgrade Now" CTA button

**Locked Features:**
- Premium cards show blur overlay
- Lock icon with "Upgrade to Premium" text
- Teaser content visible (Performance Age)

## Dark Mode

The application uses a dark-only theme:
- Landing page: Deep black-violet (#0A0612)
- Dashboard: Dark charcoal (#141414)
- Text is white/light gray
- Red accents provide visual interest
- High contrast for readability
