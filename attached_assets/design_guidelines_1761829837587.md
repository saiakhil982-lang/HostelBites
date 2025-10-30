# Design Guidelines: HostelBites Meal Tracker

## Design Approach
**Reference-Based with Community Focus**: Drawing inspiration from friendly, community-oriented apps like Discord (for group interaction), Notion (for clean data display), and Instagram (for vibrant, engaging aesthetics). The design celebrates communal living with playful, warm visuals while maintaining functional clarity.

## Core Design Principles
1. **Warmth & Playfulness**: Create an inviting, fun atmosphere that encourages participation
2. **Instant Clarity**: Users should immediately understand how to vote and see live results
3. **Community Visibility**: Celebrate participation by prominently displaying who's eaten
4. **Lightweight Interaction**: Minimal steps from landing to voting

---

## Color Palette

### Primary Colors (Dark Mode)
- **Background Gradient**: Deep plum to midnight purple (280 35% 12% → 260 40% 8%)
- **Card Backgrounds**: Semi-transparent with blur (280 30% 18% with 15% opacity)
- **Primary Pink**: 340 75% 55% (vibrant, energetic)
- **Primary Purple**: 280 60% 60% (supportive accent)

### Primary Colors (Light Mode)
- **Background Gradient**: Soft pink to lavender to mint (350 100% 97% → 280 60% 97% → 160 60% 97%)
- **Card Backgrounds**: White with subtle tint (0 0% 100% with 55% opacity)
- **Primary Pink**: 340 85% 47% (rich, warm)
- **Primary Purple**: 280 70% 50% (sophisticated accent)

### Meal-Specific Accents
- **Breakfast**: Soft coral pink (10 80% 65%)
- **Lunch**: Warm lavender (270 50% 65%)
- **Dinner**: Fresh mint (160 45% 55%)

### Semantic Colors
- **Success**: 142 70% 45% (green for completed votes)
- **Text Primary (Dark)**: 280 15% 95%
- **Text Primary (Light)**: 280 30% 15%
- **Text Secondary**: 280 10% 60%

---

## Typography

### Font Families
- **Primary**: 'Poppins' (Google Fonts) - friendly, rounded, modern
- **Fallback**: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif

### Type Scale
- **Hero Title**: 2.5rem (40px), weight 700, letter-spacing -0.02em
- **Section Headers**: 1.5rem (24px), weight 600
- **Card Titles**: 1.125rem (18px), weight 600
- **Body Text**: 0.875rem (14px), weight 400
- **Small Text**: 0.75rem (12px), weight 400
- **Count Numbers**: 2.5rem (40px), weight 700, tabular-nums

---

## Layout System

### Spacing Primitives
**Core Units**: Tailwind 2, 4, 6, 8 for consistent rhythm
- **Tight spacing**: p-2, gap-2 (form elements, inline groups)
- **Standard spacing**: p-4, gap-4 (card interiors, button padding)
- **Generous spacing**: p-6, gap-6 (section padding, card gaps)
- **Section spacing**: py-8, py-12 (vertical section rhythm)

### Grid Structure
- **Desktop**: 3-column grid (2 columns for meal cards, 1 for live summary)
- **Tablet**: 2-column grid (meal cards stack to 2 cols, summary below)
- **Mobile**: Single column stack

### Container Widths
- **Max Width**: 1280px (max-w-6xl)
- **Content Cards**: Full width within grid cells
- **Form Inputs**: Full width within cards

---

## Component Library

### Meal Cards
**Visual Treatment**:
- Large emoji icons (text-4xl) as meal identifiers
- Gradient backgrounds specific to meal type
- Glass-morphism effect with 6px blur
- Gentle shadow (shadow-lg)
- Hover: Lift 6px with subtle scale (translateY(-6px) scale(1.01))
- Rounded corners: 1rem (rounded-2xl)

**Content Structure**:
- Meal name + emoji (top left)
- Count display (top right): Large number + "Yet to eat" secondary count
- Name input with datalist autocomplete
- Primary CTA button "I've eaten"
- Scrollable list of participants (max-h-40 with overflow-auto)

### Buttons
**Primary CTA**:
- Background: Primary pink
- Padding: px-4 py-2
- Rounded: rounded-lg
- Font: 600 weight, 0.875rem
- Hover: Slight brightness reduction (brightness-95)
- Active: Confetti animation trigger

**Secondary Actions** (Export CSV):
- Background: Light pink tint (340 100% 95%)
- Text: Primary pink
- Smaller padding: px-3 py-1
- Text size: 0.75rem

### Input Fields
**Name Input**:
- Border: 1px solid with 10% opacity border
- Padding: p-2
- Rounded: rounded-lg
- Focus: Remove default outline, apply ring-2 with primary color
- Placeholder: 60% opacity text

### Progress Bars
- Container: Full width, h-2, rounded, gray-200 background
- Fill: Rounded, meal-specific color, animated width transition
- Display percentages with smooth transitions

### Tutorial Overlay
- Full-screen backdrop: Black 40% opacity
- Modal: White card, rounded-2xl, shadow-xl, max-width 24rem
- Center-aligned content with emoji, title, description
- Primary CTA to dismiss

---

## Animations & Interactions

### Micro-interactions
- **Card Hover**: 220ms cubic-bezier(0.2, 0.9, 0.3, 1) for lift effect
- **Button Press**: Immediate confetti burst (80 particles, 60-degree spread)
- **Data Updates**: Fade-in new entries in participant lists
- **Progress Bars**: Smooth width transitions over 400ms

### Live Updates
- Auto-refresh every 5 seconds (silent, no loading indicators)
- Subtle pulse on count number when data changes

### Celebrations
- Confetti on successful vote (canvas-confetti library)
- No persistent animations to avoid distraction

---

## Images

**No hero image required** - This is a utility app where immediate functionality takes precedence over marketing visuals.

**Emoji Usage**:
- Primary branding: 💖 (heart) in header
- Meal identifiers: 🥐 (Breakfast), 🍱 (Lunch), 🍲 (Dinner)
- Decorative use in tutorial overlay

---

## Special Considerations

### Glass-morphism Implementation
- Backdrop-filter: blur(6px)
- Background: rgba() with 55% opacity for light mode, 15% for dark mode
- Ensure content contrast meets WCAG AA standards

### Data Display Hierarchy
1. **Immediate Impact**: Current eaten count (largest, boldest)
2. **Secondary Context**: "Yet to eat" count (smaller, muted)
3. **Detail Level**: Participant names (scrollable, tertiary importance)

### Responsive Behavior
- Mobile: Stack all cards vertically, maintain full functionality
- Tablet: 2-column layout for meal cards, summary below
- Desktop: 3-column grid with summary sidebar

### Accessibility
- Sufficient color contrast on all text (4.5:1 minimum)
- Clear focus indicators on interactive elements
- Semantic HTML structure for screen readers
- Touch targets minimum 44x44px for mobile

---

**Design Personality**: Friendly, energetic, community-focused. This is a tool for a close-knit group, so the design should feel warm and inclusive while remaining highly functional for daily use.