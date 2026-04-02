# NeuroSplit — Frontend Spec (React + Tailwind)

> **Scope:** This spec covers only the React frontend. The backend (FastAPI) and TRIBE v2 integration are handled by other team members. This document defines the starting website, the dashboard, and the data contracts between frontend and backend.

---

## What this frontend does

Two things:

1. **The starting website** — a Londonmaxxing-themed landing page that exists to be analysed by TRIBE v2. It renders in two visually distinct variants. This is the test subject.
2. **The dashboard** — a control panel that triggers analysis, displays brain activity comparisons, and declares which variant the brain prefers.

---

## 1. Starting website: Londonmaxxing landing page

### Concept

A bold, single-page site capturing the energy of London's tech/startup moment. The content stays the same across variants — the visual treatment changes. This gives TRIBE v2 two meaningfully different stimuli to compare.

### Content blocks (shared across both variants)

1. **Hero** — "Something is happening in London right now." Full-viewport hero with headline, subline, and background treatment.
2. **Pulse strip** — 3–4 live-feeling stats: "350,000+ people reached", "R&D spend up 30% since 2018", "1 city, endless builders", "The movement is real".
3. **Manifesto excerpt** — 2–3 punchy paragraphs from the Londonmaxxing ethos. "Go to the thing. Reply YES. Leave the house. Cross the river."
4. **People grid** — 6 avatar placeholders with one-line descriptors: "Between things", "Building something unnamed", "Accidentally excellent at something niche".
5. **CTA** — "Find your Londonmaxxing people" with email capture field and signature-style button.

### Variant A: "Electric London" (high stimulation)

The maximalist, high-energy version. This should light up the ventral visual stream.

| Element | Treatment |
|---------|-----------|
| Background | Deep black (#0A0A0A) with hot accent gradients (electric blue #00A3FF → magenta #FF3CAC) |
| Typography | Bold, compressed, large scale. Hero headline 72px+. Tight letter-spacing. All-caps headers. |
| Layout | Dense. Cards overlap slightly. Elements feel stacked and urgent. |
| Colour | High contrast. Neon accents on dark. Glowing borders on cards. |
| Motion | Pulse animations on stats. Gradient shifts on hero. Subtle glow on CTA. |
| Imagery | Abstract geometric — sharp angles, grid patterns, data-viz aesthetic |
| Feel | A tech conference keynote stage. Intense. Electric. Shoreditch at midnight. |

### Variant B: "Golden London" (warm stimulation)

The considered, editorial version. Still stimulating, but through warmth and craft rather than intensity.

| Element | Treatment |
|---------|-----------|
| Background | Warm cream (#FFFBF0) with deep navy (#0C1B33) text |
| Typography | Elegant serif for headlines (use Google Font: Playfair Display or similar). Generous line-height. Mixed case. |
| Layout | Spacious. Generous padding. Content breathes. Clear visual hierarchy. |
| Colour | Warm palette: deep gold (#C5960C), terracotta (#C75B39), navy. Low contrast, high sophistication. |
| Motion | None or very slow fade-ins on scroll. Stillness as a design choice. |
| Imagery | Soft, organic shapes. Gentle curves. Watercolour-wash textures via CSS gradients. |
| Feel | A Sunday broadsheet long-read. A members' club library. Golden hour on the South Bank. |

### Why these two variants work for TRIBE v2

The ventral visual stream (object recognition, visual processing) responds differently to:
- **Spatial frequency**: Variant A is high-frequency (sharp edges, dense layout). Variant B is low-frequency (soft edges, spacious).
- **Colour contrast**: A is high-contrast neon-on-black. B is low-contrast warm-on-warm.
- **Arousal level**: A targets alertness. B targets comfort.

These are the exact visual properties that should produce divergent predicted brain activity — making the comparison meaningful, not noise.

### Variant switching

Controlled by URL parameter: `/website?variant=a` and `/website?variant=b`.

Both variants share the same component tree. Styling differences are driven by a config map:

```typescript
// variants.config.ts
export type VariantId = 'a' | 'b';

export interface VariantTheme {
  hero: {
    containerClass: string;
    headlineClass: string;
    sublineClass: string;
  };
  pulseStrip: {
    containerClass: string;
    cardClass: string;
    valueClass: string;
    labelClass: string;
  };
  manifesto: {
    containerClass: string;
    textClass: string;
  };
  peopleGrid: {
    containerClass: string;
    avatarClass: string;
    descriptorClass: string;
  };
  cta: {
    containerClass: string;
    buttonClass: string;
    inputClass: string;
  };
}

export const variants: Record<VariantId, VariantTheme> = {
  a: {
    hero: {
      containerClass: 'min-h-screen bg-[#0A0A0A] flex items-center justify-center relative overflow-hidden',
      headlineClass: 'text-7xl font-black tracking-tighter text-white uppercase leading-none',
      sublineClass: 'text-lg text-cyan-300 tracking-wide uppercase mt-4',
    },
    // ... (complete for all sections)
  },
  b: {
    hero: {
      containerClass: 'min-h-screen bg-[#FFFBF0] flex items-center justify-center relative overflow-hidden',
      headlineClass: 'text-6xl font-serif font-light text-[#0C1B33] leading-snug',
      sublineClass: 'text-base text-[#7A6E5A] mt-6 tracking-wide',
    },
    // ... (complete for all sections)
  },
};
```

### Component structure

```
src/starting-website/
├── StartingWebsite.tsx        # Reads ?variant= param, passes theme to children
├── components/
│   ├── Hero.tsx               # Full-viewport hero block
│   ├── PulseStrip.tsx         # Stats row
│   ├── Manifesto.tsx          # Text block
│   ├── PeopleGrid.tsx         # Avatar grid
│   └── CTA.tsx                # Email capture + button
└── variants.config.ts         # Theme class maps
```

Each component accepts a `theme` prop (the relevant slice of `VariantTheme`) and applies classes from it. No conditional styling logic inside components — all variation lives in the config.

---

## 2. Dashboard

### Purpose

The operator's view. Triggers analysis, shows results, declares a winner.

### Layout

```
┌──────────────────────────────────────────────────────┐
│  NeuroSplit          [Variant A ▾] [Variant B ▾]     │
│                                        [Run test ▶]  │
├─────────────────────────┬────────────────────────────┤
│                         │                            │
│   Variant A preview     │   Variant B preview        │
│   (live iframe or       │   (live iframe or          │
│    screenshot)          │    screenshot)             │
│                         │                            │
├─────────────────────────┴────────────────────────────┤
│                                                      │
│   Brain activity comparison                          │
│                                                      │
│   ┌─ Variant A ──────────────────────── 0.73 ─┐     │
│   ┌─ Variant B ──────────────── 0.61 ─────────┐     │
│                                                      │
│   Winner: Variant A — "Electric London"    ✦         │
│   "Higher predicted ventral stream activation        │
│    suggests stronger visual engagement"              │
│                                                      │
├──────────────────────────────────────────────────────┤
│   Iteration history                  (stretch goal)  │
│   ┌────┐ ┌────┐ ┌────┐                              │
│   │ R1 │→│ R2 │→│ R3 │                              │
│   │A ✦ │ │B'✦ │ │A'✦ │                              │
│   └────┘ └────┘ └────┘                              │
└──────────────────────────────────────────────────────┘
```

### Component structure

```
src/dashboard/
├── Dashboard.tsx              # Main layout + state
├── VariantPreview.tsx         # Iframe or screenshot thumbnail with label
├── ComparisonPanel.tsx        # Score bars + winner badge + interpretation
├── BrainActivityBar.tsx       # Single horizontal bar (score visualisation)
├── IterationHistory.tsx       # (stretch) Timeline of test rounds
└── RunTestButton.tsx          # Triggers pipeline, shows loading state
```

### State

```typescript
interface DashboardState {
  variantA: VariantId;
  variantB: VariantId;
  isRunning: boolean;
  status: 'idle' | 'capturing' | 'analysing' | 'comparing' | 'done' | 'error';
  screenshots: {
    a: string | null;  // URL to screenshot image
    b: string | null;
  };
  results: {
    a: BrainActivityResult | null;
    b: BrainActivityResult | null;
  };
  comparison: ComparisonResult | null;
  history: ComparisonResult[];
  error: string | null;
}
```

### Loading states

The pipeline has distinct phases. Show progress through them:

1. **Capturing** — "Screenshotting variants..." (pulsing camera icon)
2. **Analysing** — "Running TRIBE v2 brain prediction..." (brain icon with pulse)
3. **Comparing** — "Comparing neural responses..." (two bars animating)
4. **Done** — Winner revealed with score bars snapping to final values

Use a simple stepper/progress indicator above the comparison panel.

---

## 3. Data contracts (frontend ↔ backend)

These are the shapes you'll fetch from the FastAPI backend. Build against these interfaces and use mock data until the backend is live.

### Request: Capture screenshot

```typescript
// POST /capture
// Request
{ variant_id: 'a' | 'b', url?: string }

// Response
{ screenshot_path: string, variant_id: string, timestamp: string }
```

### Request: Analyse screenshot

```typescript
// POST /analyse
// Request
{ screenshot_path: string }

// Response: BrainActivityResult
{
  variant_id: string;
  ventral_score: number;       // 0–1, aggregated ventral stream activation
  dorsal_score: number;        // 0–1, dorsal stream (spatial awareness)
  prefrontal_score: number;    // 0–1, prefrontal (decision/attention)
  overall_engagement: number;  // 0–1, weighted composite
  timestamp: string;
}
```

### Request: Compare results

```typescript
// POST /compare
// Request
{ result_a: BrainActivityResult, result_b: BrainActivityResult }

// Response: ComparisonResult
{
  winner: 'a' | 'b';
  score_a: number;
  score_b: number;
  delta: number;
  interpretation: string;     // e.g. "Variant A produced 18% higher ventral activation"
  round: number;
}
```

### Mock data for development

```typescript
// mocks/data.ts
export const mockAnalysisA: BrainActivityResult = {
  variant_id: 'a',
  ventral_score: 0.73,
  dorsal_score: 0.61,
  prefrontal_score: 0.68,
  overall_engagement: 0.71,
  timestamp: new Date().toISOString(),
};

export const mockAnalysisB: BrainActivityResult = {
  variant_id: 'b',
  ventral_score: 0.58,
  dorsal_score: 0.72,
  prefrontal_score: 0.64,
  overall_engagement: 0.62,
  timestamp: new Date().toISOString(),
};

export const mockComparison: ComparisonResult = {
  winner: 'a',
  score_a: 0.71,
  score_b: 0.62,
  delta: 0.09,
  interpretation: 'Variant A ("Electric London") produced 14% higher overall neural engagement, with particularly strong ventral stream activation suggesting greater visual processing intensity.',
  round: 1,
};
```

---

## 4. Routing

```typescript
// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

<BrowserRouter>
  <Routes>
    <Route path="/website" element={<StartingWebsite />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/" element={<Navigate to="/dashboard" />} />
  </Routes>
</BrowserRouter>
```

- `/website?variant=a` — renders Variant A full-screen (no dashboard chrome)
- `/website?variant=b` — renders Variant B full-screen (no dashboard chrome)
- `/dashboard` — the control panel (default route)

---

## 5. File tree

```
neurosplit-frontend/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── api/
│   │   └── neurosplit.ts            # Fetch calls to FastAPI
│   ├── mocks/
│   │   └── data.ts                  # Mock responses for dev
│   ├── starting-website/
│   │   ├── StartingWebsite.tsx
│   │   ├── variants.config.ts
│   │   └── components/
│   │       ├── Hero.tsx
│   │       ├── PulseStrip.tsx
│   │       ├── Manifesto.tsx
│   │       ├── PeopleGrid.tsx
│   │       └── CTA.tsx
│   ├── dashboard/
│   │   ├── Dashboard.tsx
│   │   ├── VariantPreview.tsx
│   │   ├── ComparisonPanel.tsx
│   │   ├── BrainActivityBar.tsx
│   │   ├── IterationHistory.tsx
│   │   └── RunTestButton.tsx
│   └── types/
│       └── index.ts                 # Shared interfaces
├── tailwind.config.js
├── tsconfig.json
├── package.json
├── vite.config.ts
└── index.html
```

---

## 6. Dependencies

```json
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "react-router-dom": "^6"
  },
  "devDependencies": {
    "tailwindcss": "^3",
    "autoprefixer": "^10",
    "postcss": "^8",
    "vite": "^5",
    "@types/react": "^18",
    "typescript": "^5"
  }
}
```

No charting library. Brain activity bars are pure Tailwind divs with dynamic width. Keep deps minimal — hackathon speed.

---

## 7. Acceptance criteria

### MVP (must ship)

- [ ] Variant A ("Electric London") renders at `/website?variant=a` — dark, neon, intense
- [ ] Variant B ("Golden London") renders at `/website?variant=b` — warm, editorial, spacious
- [ ] Both variants share identical content, differ only in visual treatment
- [ ] Dashboard renders at `/dashboard` with two preview panels
- [ ] "Run test" button triggers API calls (or mocks) and displays results
- [ ] Comparison panel shows score bars and winner declaration
- [ ] Loading states communicate pipeline progress
- [ ] Works on laptop screen (1280px+)

### Stretch

- [ ] Iteration history timeline showing multiple rounds
- [ ] Variant selector dropdowns (if more than 2 variants exist)
- [ ] Brain region breakdown (ventral/dorsal/prefrontal as separate bars)
- [ ] Animated score reveal (bars growing to final width on result)

---

## 8. Risks

| Risk | Mitigation |
|------|------------|
| Backend not ready when frontend is | Build against mocks first. Toggle `USE_MOCKS=true` in env. |
| Variants look too similar for TRIBE v2 to differentiate | Push extremes: A should be aggressively dark/neon, B should be aggressively warm/spacious. Don't play it safe. |
| Dashboard looks generic | The Londonmaxxing brand energy should bleed into the dashboard too. Use the same typography and a subtle dark theme. |
| iframe variant previews are slow or blocked | Fall back to screenshot images served by backend. Have both paths coded. |
| Scope creep in 6 hours | The starting website is the hero deliverable. If time runs short, a beautiful starting website with two variants + a basic comparison display wins over a complex dashboard with a mediocre website. |