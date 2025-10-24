# Project MAC - AI Poker Game Design Guidelines

## Design Approach

**Selected Approach:** Reference-Based (Gaming Application)

**Key References:** Modern online poker platforms (PokerStars aesthetic clarity), casino gaming interfaces (engaging visual hierarchy), and personality-driven game UIs (character presence like Duolingo's owl but sassier).

**Core Principles:**
1. Casino elegance meets modern web app clarity
2. Cassie's personality is visually present, not just textual
3. Game state is always immediately readable
4. Information hierarchy prioritizes critical poker decisions

---

## Typography System

**Font Families:**
- Primary (UI/Body): Inter or DM Sans via Google Fonts
- Display (Cassie's Commentary): Playfair Display or Crimson Pro for theatrical flair
- Monospace (Chips/Stats): JetBrains Mono for numeric clarity

**Type Scale:**
- Dealer Commentary: text-2xl to text-3xl (theatrical presence)
- Game Actions/Buttons: text-lg font-semibold
- Player Names/Stats: text-base font-medium
- Chip Counts: text-xl font-mono font-bold
- Pot Display: text-3xl font-mono font-black (center attention)
- Card Labels: text-sm font-medium
- Hints: text-base leading-relaxed (readable guidance)

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Tight spacing (buttons, cards): p-2, gap-2
- Component padding: p-4, p-6
- Section spacing: p-8, gap-8
- Major layout gaps: p-12, gap-12
- Viewport margins: p-16

**Grid Structure:**
- Main game area: Full viewport layout with fixed positioning for poker table
- Poker table: Centered elliptical or rounded rectangle (max-w-6xl)
- Player positions: Radial arrangement around table center (3-4 positions for 1-3 bots + human)
- Control panel: Fixed bottom bar (h-24 to h-32)

---

## Component Library

### Core Game Components

**Poker Table Container**
- Central focus with subtle felt texture (via pattern/gradient, not solid)
- Rounded corners (rounded-3xl)
- Shadow for depth (shadow-2xl)
- Contains community cards, pot, and dealer position indicator

**Card Components**
- Standard poker card aspect ratio (2.5:3.5)
- Hole cards: w-16 to w-20 per card, gap-2
- Community cards: w-20 to w-24 per card, gap-3
- Cards have rounded corners (rounded-lg)
- Reveal animation: flip transition (transform + opacity)
- Face-down cards: Show provided CardBack assets

**Player Seat Layout**
- Each seat container: flex column with avatar, name, chips, cards
- Avatar area: w-16 h-16 rounded-full (placeholder or simple icon)
- Chip stack display: Font-mono, bold, with chip icon/emoji
- Active player indicator: Border or glow effect (border-4)
- Player container spacing: p-4, gap-2

**Dealer (Cassie) Commentary Zone**
- Fixed position at table top or floating card (top-8 left-1/2 -translate-x-1/2)
- Speech bubble aesthetic: rounded-2xl, p-6
- Avatar representation: Small circular avatar (w-12 h-12) to left of text
- Commentary text: text-2xl, leading-relaxed, theatrical font
- Entry animation: Slide-in or fade-in (opacity + transform)
- Minimum height to prevent layout shift: min-h-24

**Pot Display**
- Center of table, visually prominent
- Chip icon/stack visual
- Large monospace number: text-3xl font-mono font-black
- Label "POT" above in text-sm uppercase tracking-wide

**Betting Control Panel**
- Fixed bottom bar (fixed bottom-0 w-full)
- Container: p-6, flex justify-between items-center
- Action buttons (Call, Fold, Check, Raise): Grouped with gap-4
- Raise amount selector: Slider or numeric input
- "Get Hint" button: Positioned separately (right side) with distinct styling
- All buttons: h-12 to h-14, px-6 to px-8, rounded-xl, text-lg font-semibold

**Hint Modal/Card**
- Overlay (z-50) or slide-in panel
- Card style: rounded-2xl, p-8, max-w-md
- Cassie's avatar larger here (w-20 h-20)
- Hint text: text-lg leading-relaxed
- Close button: Absolute positioned (top-4 right-4)

**Stats Panel**
- Compact sidebar or top bar
- Shows: Games Played, Wins, Losses, Current Streak
- Each stat: flex flex-col items-center, gap-1
- Number: text-2xl font-mono font-bold
- Label: text-xs uppercase tracking-wide

**Game Phase Indicator**
- Visual progress bar or chip trail showing Pre-flop → Flop → Turn → River
- Active phase highlighted
- Positioned above community cards or in top bar

### Navigation & Controls

**Game Setup Screen**
- Centered card (max-w-lg)
- Title: text-4xl font-display (Cassie introduces herself)
- Bot count selector: Radio buttons or number picker (1-3 bots)
- Starting chips display: text-xl font-mono
- "Deal Me In" primary button: Large (h-16), full width

**End of Hand Modal**
- Overlay with backdrop blur
- Results card: rounded-3xl, p-12, max-w-2xl
- Winner announcement: text-3xl font-display
- Winning hand visualization: Cards displayed horizontally
- Chip changes: Animated count-up, font-mono
- Action buttons (Play Again, Exit): flex gap-4, both h-14

---

## Animation Guidelines

**Minimal Motion:**
- Card dealing: Staggered fade-in with slight slide (duration-300)
- Chip movement to pot: Slide transform (duration-500)
- Cassie's commentary: Fade-in with slight bounce (duration-400)
- Winner reveal: Scale + opacity (duration-700)
- Button interactions: Standard hover scale (scale-105, duration-200)

**No Continuous Animations:** Avoid spinning chips, pulsing elements, or looping effects

---

## Images

### Required Image Assets

**Poker Table Background**
- Full table surface image (generated via Recraft.ai or similar)
- Shows felt texture, subtle oval/rounded rectangle shape
- Placement: Background of main game container
- Size: Cover full container, centered

**Card Assets**
- 52 individual card images (standard deck) OR single sprite sheet
- CardBack image (provided in zip file)
- Aspect ratio: 2.5:3.5
- Style: Classic poker cards or modern minimalist design

**Cassie Avatar/Character**
- Circular portrait for commentary zone (128x128 or higher)
- Style: Illustrated casino dealer or AI character
- Personality: Confident, sassy expression
- Used in: Commentary zone, hint modal, welcome screen

**Chip Icons**
- Simple poker chip icons/emojis for chip stacks
- Or use Font Awesome/Heroicons: currency-dollar, chart-bar

**No Hero Section:** This is a game application, not a marketing page. Game table IS the main view.

---

## Responsive Behavior

**Desktop (Primary Target):**
- Full poker table layout, radial player positions
- Commentary zone floating over table
- All controls visible simultaneously

**Tablet (md: breakpoint):**
- Slightly condensed table
- Player positions adjusted to fit
- Commentary zone may shift to top bar

**Mobile (Base):**
- Stack layout: Community cards top, player bottom
- AI bots summarized in compact view (chips + status only)
- Betting controls remain fixed bottom
- Cassie commentary in top banner (collapsible)
- Hint modal full-screen overlay

---

## Accessibility

- All buttons have clear focus states (ring-4)
- Card values announced via aria-labels
- Game state changes announced to screen readers
- Sufficient contrast for chip counts and text
- Keyboard navigation for all betting actions (Tab, Enter, Arrow keys)

---

## Technical Specifications

**Icon Library:** Heroicons (via CDN) for UI elements (chevrons, close, info, etc.)

**No Custom SVG Icons:** Use library icons exclusively

**Performance:**
- Lazy load card images
- Preload critical assets (table, CardBack)
- Optimize commentary updates (don't re-render entire UI)

**Layout Containment:**
- Game container: min-h-screen to prevent scrolling
- Fixed positions for controls and commentary
- Overflow hidden on game area