# LEVEL UP — Design System & Brand Guide

> A gamified fitness PWA with anime-inspired progression.  
> Dark. Powerful. Minimal. Addictive.

---

## PHASE 1 — DESIGN SYSTEM

### 1.1 Color Palette

| Token              | Value       | Usage                                     |
| ------------------- | ----------- | ----------------------------------------- |
| `--color-primary`   | `#06B6D4`   | Primary interactive (buttons, links, XP)  |
| `--color-secondary` | `#8B5CF6`   | Progression, rank, XP accents             |
| `--color-accent`    | `#F59E0B`   | Rewards, gold, achievements, XP numbers   |
| `--color-success`   | `#10B981`   | Completed, positive states                |
| `--color-danger`    | `#F43F5E`   | Errors, destructive actions               |
| `--color-warning`   | `#F97316`   | Warnings, streak (fire)                   |
| **Backgrounds**     |             |                                           |
| `--bg-void`         | `#030303`   | Page background                           |
| `--bg-surface`      | `#0A0A0C`   | Card level 1, sections                    |
| `--bg-elevated`     | `#111114`   | Card level 2, modals, floating            |
| `--bg-overlay`      | `#1A1A1E`   | Hover states, overlays                    |
| **Borders**         |             |                                           |
| `--border-subtle`   | `rgba(255,255,255,0.06)` | Default card borders          |
| `--border-hover`    | `rgba(255,255,255,0.12)` | Hover state borders           |
| `--border-active`   | `rgba(255,255,255,0.20)` | Active/focus borders          |
| **Text**            |             |                                           |
| `--text-primary`    | `#FAFAFA`   | Headings, primary text                    |
| `--text-secondary`  | `#A1A1AA`   | Body text, labels                         |
| `--text-muted`      | `#52525B`   | Captions, disabled, metadata              |
| `--text-ghost`      | `#3F3F46`   | Placeholder, very subtle                  |

#### Rank Color System
| Rank     | Color     | Glow                     |
| -------- | --------- | ------------------------ |
| E        | `#6B7280` | None                     |
| D        | `#64748B` | Subtle gray              |
| C        | `#06B6D4` | Cyan pulse               |
| B        | `#10B981` | Green glow               |
| A        | `#F59E0B` | Amber blaze              |
| S        | `#EF4444` | Red inferno              |
| NATIONAL | `#8B5CF6` | Purple aurora + particles |

### 1.2 Typography System

| Role       | Size    | Weight   | Tracking    | Font            | Usage                       |
| ---------- | ------- | -------- | ----------- | --------------- | --------------------------- |
| Display    | 48–72px | Black    | -0.03em     | System + italic | Hero text, rank letters     |
| H1         | 24px    | Bold     | -0.02em     | System          | Page titles                 |
| H2         | 18px    | Semibold | -0.01em     | System          | Section titles              |
| H3         | 15px    | Medium   | 0           | System          | Card titles                 |
| Body       | 14px    | Normal   | 0           | System          | Content text                |
| Small      | 12px    | Normal   | 0           | System          | Secondary info              |
| Caption    | 10px    | Medium   | 0.1em       | System          | Uppercase labels, metadata  |
| Mono       | 14px    | Bold     | 0           | Monospace       | Numbers, XP, stats, timers  |
| Mono-sm    | 11px    | Medium   | 0.05em      | Monospace       | Stat labels, counters       |

### 1.3 Spacing System (4px base grid)

| Token | Value | Usage                    |
| ----- | ----- | ------------------------ |
| xs    | 4px   | Icon gaps, micro spacing |
| sm    | 8px   | Tight element gaps       |
| md    | 12px  | Standard gaps            |
| base  | 16px  | Card padding (mobile)    |
| lg    | 20px  | Card padding (desktop)   |
| xl    | 24px  | Section gaps             |
| 2xl   | 32px  | Page section spacing     |
| 3xl   | 48px  | Hero spacing             |

### 1.4 Border Radius

| Token   | Value | Usage                       |
| ------- | ----- | --------------------------- |
| sm      | 8px   | Badges, small tags          |
| md      | 12px  | Buttons, inputs             |
| lg      | 16px  | Cards, panels               |
| xl      | 20px  | Featured cards, modals      |
| full    | 9999px| Pills, avatars, dot badges  |

### 1.5 Card Styles

1. **Surface Card** — Default container  
   `bg-[#0A0A0C] border border-white/[0.06] rounded-2xl`
   
2. **Elevated Card** — Floating/active  
   `bg-[#111114] border border-white/[0.08] rounded-2xl shadow-xl shadow-black/40`

3. **Accented Card** — Highlighted feature  
   `bg-gradient-to-br from-cyan-500/[0.04] to-transparent border-cyan-500/[0.15]`

4. **Glass Card** — Overlays, modals  
   `bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]`

5. **Interactive Card** — Clickable items  
   `hover:border-white/[0.15] hover:bg-white/[0.02] active:scale-[0.98] transition-all`

### 1.6 Button Variants

| Variant     | Style                                                          |
| ----------- | -------------------------------------------------------------- |
| Primary     | Cyan gradient, glow shadow, white text                         |
| Secondary   | Transparent, white/10 border, hover: white/15                  |
| Ghost       | Text only, hover: bg-white/5                                   |
| Accent      | Amber gradient for rewards/CTAs                                |
| Danger      | Rose outline, rose/10 bg                                       |
| Icon        | Square, subtle bg, rounded-xl                                  |

### 1.7 XP Bar Design

- Height: 6px (compact), 10px (full)
- Background: `bg-white/[0.06]` 
- Fill: Gradient `from-cyan-400 via-blue-500 to-violet-500`
- Glow: `box-shadow: 0 0 12px rgba(6,182,212,0.4)`
- Animated fill on mount with CSS transition (1.2s ease-out)
- Sparkle particle at fill tip (CSS pseudo-element)

### 1.8 Icon Style Guidelines

- Library: Lucide React (outline style, 1.5px stroke)
- Sizes: 14px (inline), 18px (buttons), 20px (cards), 24px (nav)
- Color: Inherit parent text color
- Active state: Fill current color for emphasis (e.g., fire icon filled)
- Never use more than 2 icon sizes on the same row

---

## PHASE 2 — BRAND IDENTITY

### 2.1 Tone of Voice

**Personality**: Confident, minimal, commanding. Like a game system UI whispering power.

- Short sentences. No fluff.
- Imperative mood: "Complete quest", "Claim reward", not "Would you like to..."
- System-like: Feels like an AI companion tracking your power level
- Never patronizing. Always respectful of effort.

### 2.2 Microcopy Examples

| Context              | Copy                                       |
| -------------------- | ------------------------------------------ |
| Login CTA            | `INITIALIZE`                               |
| Register CTA         | `BEGIN AWAKENING`                           |
| Workout logged       | `+{xp} XP ACQUIRED`                        |
| Quest completed      | `QUEST CLEAR ✦`                            |
| Streak maintained    | `STREAK INTACT — {n} DAYS`                 |
| Streak lost          | `STREAK BROKEN. RISE AGAIN.`               |
| Rank up              | `RANK ASCENSION: {rank}`                   |
| Level up             | `POWER SURGE — LEVEL {n}`                  |
| Empty workout list   | `NO RECORDS. YOUR JOURNEY BEGINS NOW.`     |
| Loading              | `ANALYZING...`                             |
| Error                | `SYSTEM ERROR. RETRY.`                     |
| Welcome back         | `WELCOME BACK, HUNTER.`                    |
| First time           | `SYSTEM AWAKENED. INITIALIZING PROFILE...` |

### 2.3 Notification Style

```
┌──────────────────────────────────────┐
│ ◉ SYSTEM                            │
│ +125 XP acquired. Quest progress    │
│ updated.                            │
└──────────────────────────────────────┘
```

- Rounded pill shape, frosted glass bg
- Dot indicator (colored by type: cyan=info, green=success, amber=reward, rose=error)
- Auto-dismiss in 3s with slide-up exit
- No more than 1 toast visible at a time

### 2.4 Emotional Theme

**Core feeling**: "I am the protagonist leveling up in real life."

- Power fantasy: Every action earns tangible progress
- Scarcity: Daily quests expire, creating urgency
- Social proof: Leaderboards and guilds
- Collection: Streak milestones, rank badges, quest history
- Momentum: Streak visuals, XP bar that's always moving

---

## PHASE 3 — UI SCREEN REDESIGNS

### Dashboard (Home)
- **Layout**: Single column on mobile, 2-column (5:7) on desktop
- **Hierarchy**: (1) Streak flame + rank badge header → (2) XP bar → (3) Daily stats grid → (4) Active quests → (5) Weekly chart → (6) Insights
- **Remove**: "Quick Log" clutters dashboard — move to Workout page
- **Highlight**: XP bar should be the most prominent element below the header
- **Premium feel**: Animated XP counter, subtle glow on rank badge, streak fire animation

### Quest Screen
- **Layout**: Stats banner top → Filter tabs → Quest list (cards)
- **Remove**: Nothing, well-structured already
- **Highlight**: Quest cards with progress bars that animate on mount
- **Premium feel**: Difficulty badges with colored dot, shimmer on uncompleted quests

### Workout Screen
- **Layout**: Today's stats → Category tabs → Exercise grid (2-col) → Recent activity
- **Remove**: "Daily Quests" title (it's Workout, not Quests)
- **Highlight**: Exercise selection with icons, calorie/XP estimates visible
- **Premium feel**: Haptic-like scale animation on tap, XP reward preview

### Profile Screen
- **Layout**: Avatar + rank header → XP bar → Stats grid → Body metrics → Settings
- **Highlight**: Large rank display with glow, stats in monospace
- **Premium feel**: Animated stat counters, avatar ring glow matching rank color

### Guild Screen
- **Layout**: Tabs (My Guild / Rankings / Join) → Content
- **Highlight**: Guild leaderboard with competitive energy
- **Premium feel**: Guild code in monospace with copy animation, member list with rank badges

---

## PHASE 4 — MODERN INTERACTIONS

### 4.1 Lightweight Animations

All animations use only `transform` and `opacity` (GPU-composited).

| Animation        | Trigger                  | Effect                                          |
| ---------------- | ------------------------ | ----------------------------------------------- |
| `fadeUp`         | Page/section mount       | translateY(12px)→0, opacity 0→1, 400ms          |
| `scaleIn`        | Modal/card mount         | scale(0.96)→1, opacity 0→1, 300ms               |
| `slideUp`        | Toast appear             | translateY(100%)→0, 300ms ease-out              |
| `slideDown`      | Toast dismiss            | translateY(0)→-100%, 200ms ease-in              |
| `countUp`        | Stat number mount        | JS: requestAnimationFrame counter               |
| `xpFloat`        | XP gained                | "+25 XP" floats up and fades, 1.5s              |
| `rankGlow`       | Rank display             | Pulsing box-shadow, 3s infinite                 |
| `progressFill`   | XP bar mount             | width 0→target%, 1.2s ease-out                  |
| `questComplete`  | Quest done               | Checkmark scale bounce, 400ms                   |
| `streakPulse`    | Streak > 3               | Fire icon gentle pulse, 2s infinite             |
| `shimmer`        | Loading state            | Gradient sweep left→right, 1.5s infinite        |

### 4.2 Micro-interactions (CSS-only dopamine)

1. **Button press**: `active:scale-[0.97]` — instant physical feedback
2. **Card hover**: Border subtly brightens + translate-y(-1px) — floating feel
3. **Tab switch**: Active tab slides indicator dot underneath
4. **Toggle intensity**: Selected pill glows with its color
5. **Number change**: Brief scale(1.1) bounce on value update
6. **Progress bar fill**: Gradient animation on mount with glow at tip
7. **Avatar ring**: Slowly rotating gradient border on profile picture
8. **Nav active**: Dot indicator below active icon, not bg highlight

### 4.3 Sound Effect Strategy

Sounds are optional and controlled by user preference. Stored as tiny base64 WAV (<2KB each).

| Sound      | When               | Character           |
| ---------- | ------------------ | ------------------- |
| `tap`      | Button press       | Soft mechanical pop |
| `xp`       | XP gained          | Rising chime        |
| `complete` | Quest completed    | Triumphant ding     |
| `levelUp`  | Rank ascension     | Power surge sweep   |
| `error`    | Validation fail    | Dull thud           |

Implementation: `new Audio('data:audio/wav;base64,...').play()` — no library needed.

---

## PHASE 5 — VISUAL POLISH STRATEGY

### 5.1 How to Make It Look Premium

1. **Consistent spacing** — Use the 4px grid religiously. No arbitrary margins.
2. **Type hierarchy** — Max 3 font sizes per card. Captions in uppercase tracking-widest.
3. **Subtle gradients** — Never flat bg. Add `from-color/[0.03] to-transparent` tints.
4. **Glow effects** — Box-shadow with color on interactive elements (not everywhere).
5. **Number formatting** — Always use `.toLocaleString()` and monospace font.
6. **Transitions on everything** — `transition-all duration-200` on every interactive element.
7. **Whitespace** — More padding > more content. Let elements breathe.
8. **Border hierarchy** — 3 levels: subtle (default), hover (interaction), active (focus).

### 5.2 Common Mistakes Making It Look Like a College Project

| Mistake                           | Fix                                    |
| --------------------------------- | -------------------------------------- |
| Inconsistent border-radius        | Use 3 sizes max: 8, 12, 16px          |
| Random colors                     | 1 primary + 1 accent + neutrals only  |
| Too many font sizes               | 5 sizes max across entire app          |
| No loading states                 | Skeleton screens with shimmer          |
| Comments everywhere in code       | Remove learning/tutorial comments      |
| Using emojis as core UI           | Use proper icons, emojis only in data  |
| Flat backgrounds                  | Subtle gradients/texture               |
| No hover/active states            | Every clickable needs feedback         |
| Inconsistent spacing              | 4px grid, never arbitrary numbers      |
| Alert() / confirm()               | Custom modal components                |
| Console.log visible               | Production error handling              |

### 5.3 Improving Perceived Quality Without Heavy Assets

1. **CSS noise texture** — `background-image: url(data:image/svg+xml,...)` adds depth for 0 bytes
2. **Animated gradients** — Moving gradient bg on hero sections (CSS only)
3. **Staggered fade-in** — Cards appear one by one with 50ms delay
4. **Skeleton screens** — Pulsing placeholder shapes instead of spinners
5. **Number animations** — Values count up from 0 on mount
6. **Color-coded metrics** — Each stat type has its own color consistently
7. **Frosted glass** — backdrop-blur-xl on overlays (fallback: solid color)
8. **Dynamic favicons** — Show streak count in browser tab (future)

### 5.4 Strong First Impression on Login

1. Animated gradient background (subtle, slow-moving)
2. Brand name "LEVEL UP" with text-gradient and letter-spacing animation
3. System-boot microcopy: "System Initialization Required"
4. Clean form with floating labels and validation glow
5. CTA button with gradient + glow-on-hover
6. No clutter — just logo, form, CTA

---

## IMPLEMENTATION NOTES

### Performance Constraints
- All animations: CSS `transform` + `opacity` only (GPU-composited)
- `will-change` only on actively animating elements, removed after
- `prefers-reduced-motion` media query: disable all animations
- `backdrop-blur` fallback: solid `--bg-elevated` for low-end devices
- No animation libraries (no Framer Motion, no GSAP)
- Max 1 `setInterval` for counting animations, cleared immediately

### File Structure
```
src/
  index.css          — Design tokens, global animations, base styles
  App.css            — Minimal overrides
  components/
    ui/index.jsx     — Button, Card, Input, Toast, Spinner, StatCard, Modal
    NavBar.jsx       — Bottom navigation
    RankBadge.jsx    — Rank letter + XP bar
    XPBar.jsx        — Standalone progress bar
    AnimatedCounter.jsx — Counting number animation
    QuestCard.jsx    — Quest display card
    StreakFlame.jsx   — Streak fire display
    BodyVisualizer.jsx — SVG body silhouette
    WeeklyChart.jsx  — Recharts activity graph
```
