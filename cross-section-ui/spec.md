# NeuroSplit — Frontend Spec (React + Tailwind)

> **Scope:** React frontend only. Backend (FastAPI) and TRIBE v2 integration handled separately. This document defines the UI, the pipeline flow, and the data contracts.

---

## What this frontend does

A six-step sequential pipeline that demonstrates neuro-informed website optimisation:

```
Original site → Brain scan → LLM proposes changes → Modified site → Brain scan → Verdict
```

The user (or demo audience) walks through each step, seeing the website, its predicted brain response, what an LLM would change and why, the result of those changes, and a comparative verdict.

---

## Pipeline steps

| Step | ID | What's shown | Data source |
|------|----|-------------|-------------|
| 1 | `original` | The current Londonmaxxing website (warm, editorial variant) | Static React component |
| 2 | `scan1` | TRIBE v2 brain activity prediction for the original | `POST /analyse` or mock |
| 3 | `proposal` | LLM-generated modification plan with before/after and reasoning | `POST /propose` or mock |
| 4 | `modified` | The modified website with LLM changes applied | Static React component (variant B) |
| 5 | `scan2` | TRIBE v2 brain activity prediction for the modified version | `POST /analyse` or mock |
| 6 | `verdict` | Side-by-side comparison with percentage uplift and region breakdown | Computed from scan1 + scan2 |

---

## 1. The two website variants

Both are Londonmaxxing-themed. Same content, different visual treatment.

### Content (shared)

- **Hero**: "Something is happening in London right now."
- **Stats strip**: 350K+ reached · R&D +30% · ∞ builders
- **Manifesto excerpt**: "Go to the thing. Reply YES. Leave the house. Cross the river."
- **CTA**: "Join the movement"

### Original — "Golden London"

Warm editorial design. Low visual intensity.

- Background: warm cream `#FFFBF0`
- Text: deep navy `#0C1B33`
- Typography: serif (Playfair Display / Georgia), light weight, generous line-height
- Layout: spacious, content breathes
- Accents: gold `#C5960C`, terracotta `#C75B39`
- Motion: none
- Feel: Sunday broadsheet, members' club library

### Modified — "Electric London"

High-energy maximalist. High visual intensity.

- Background: deep black `#0A0A0A`
- Text: white, with gradient accents (cyan `#00A3FF` → magenta `#FF3CAC`)
- Typography: sans-serif, compressed, bold/black weight, tight letter-spacing, uppercase
- Layout: dense, card borders with glow effects
- Accents: neon cyan, electric blue
- Motion: subtle pulse on stats, gradient glow on CTA
- Feel: conference keynote, Shoreditch at midnight

### Why these differ enough for TRIBE v2

| Visual property | Original | Modified | Neural impact |
|----------------|----------|----------|---------------|
| Luminance contrast | Low (cream/navy) | High (black/white/neon) | Ventral stream activation scales with contrast |
| Spatial frequency | Low (spacious layout) | High (dense, many edges) | High frequency → more V1/V2 processing |
| Colour saturation | Muted | Saturated neon | Chromatic processing in V4 |
| Typography weight | Light (thin strokes) | Heavy (thick strokes) | Edge detection load differs |

---

## 2. Dashboard UI

### Layout structure

```
┌─────────────────────────────────────────────────────┐
│  NEUROSPLIT                          [Run pipeline ▶]│
├─────────────────────────────────────────────────────┤
│  ① Original  ─── ② Scan ─── ③ Proposal ─── ...     │
│     ●            ○           ○           ○    ○    ○ │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Step content — one panel at a time]               │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [← Previous]                           [Next →]   │
└─────────────────────────────────────────────────────┘
```

### Header
- App name: "NEUROSPLIT" — cyan accent on "NEURO", muted on "SPLIT"
- TRIBE v2 badge (small pill)
- "Run pipeline" button — triggers auto-advance through all 6 steps with ~2s delay per step

### Stepper bar
- 6 steps, horizontal, connected by lines
- States: active (cyan highlight), done (green check), pending (muted)
- Clickable for manual navigation (disabled during auto-run)

### Step content area
- Single panel per step, max-width ~720px, centred
- Each step has: title, description, then the main content block
- Smooth transition between steps (content swap, no animation needed for hackathon)

### Navigation
- Previous / Next buttons at bottom
- Previous disabled on step 1, Next disabled on step 6

---

## 3. Step-by-step content specs

### Step 1: Original site
- Title: "Original website — Golden London"
- Description: brief note on warm editorial design
- Content: browser-frame preview of the original variant (inline component, not iframe)

### Step 2: Brain scan (original)
- Title: "Brain response — original"
- Description: "TRIBE v2 predicted neural activation for the current design"
- Content: brain activity panel with 4 horizontal bars:
  - Ventral stream (cyan `#06b6d4`)
  - Dorsal stream (purple `#8b5cf6`)
  - Prefrontal (amber `#f59e0b`)
  - Overall engagement (green if >0.65, red if ≤0.65)
- Bars animate from 0 to final value on step entry (1.2s ease-out)
- Each bar shows: label (left), score to 2 decimal places (right), filled bar proportional to 0–1

### Step 3: LLM proposal
- Title: "LLM-proposed modifications"
- Description: "Based on the brain scan, the LLM identifies low-activation regions and proposes targeted visual changes"
- Content:
  - Strategy summary card (teal-tinted background, one-liner)
  - Array of change cards, each containing:
    - Target element name (e.g. "Hero section")
    - Before / After grid (two columns, dark background)
    - Reasoning (italic, muted text)
  - Numbered indicators per card

### Step 4: Modified site
- Title: "Modified website — Electric London"
- Description: brief note on high-contrast changes applied
- Content: browser-frame preview of the modified variant

### Step 5: Brain scan (modified)
- Same layout as step 2, but with modified variant scores
- Scores should be visibly higher (especially ventral and prefrontal)

### Step 6: Verdict
- Title: "Verdict"
- Content:
  - Large centred percentage uplift (e.g. "+40%") with gradient text
  - "neural engagement improvement" subtitle
  - Two summary cards side by side: Original score vs Modified score
  - Region breakdown table: each row shows region name, old → new score, and percentage change badge

---

## 4. Component structure

```
src/
├── App.tsx                          # Router
├── main.tsx
├── types/index.ts                   # Shared interfaces
├── api/neurosplit.ts                # Fetch calls to backend
├── mocks/data.ts                    # Mock brain data + proposal
│
├── dashboard/
│   ├── Dashboard.tsx                # Main layout, state, step orchestration
│   ├── Stepper.tsx                  # Horizontal step indicator bar
│   ├── StepContent.tsx              # Switch/router for step panels
│   ├── RunPipelineButton.tsx        # Triggers auto-advance
│   └── StepNavigation.tsx           # Previous/Next buttons
│
├── steps/
│   ├── OriginalSiteStep.tsx         # Step 1
│   ├── BrainScanStep.tsx            # Steps 2 + 5 (reusable, takes data prop)
│   ├── ProposalStep.tsx             # Step 3
│   ├── ModifiedSiteStep.tsx         # Step 4
│   └── VerdictStep.tsx              # Step 6
│
├── components/
│   ├── SitePreview.tsx              # Browser-frame wrapper for site variants
│   ├── BrainActivityBar.tsx         # Single animated score bar
│   ├── BrainScanPanel.tsx           # Group of bars + labels
│   ├── ProposalCard.tsx             # Single LLM change card
│   └── ComparisonVerdict.tsx        # Uplift display + region breakdown
│
└── website/
    ├── OriginalVariant.tsx          # "Golden London" site content
    └── ModifiedVariant.tsx          # "Electric London" site content
```

---

## 5. State

```typescript
interface PipelineState {
  currentStep: number;                    // 0–5 index into STEPS array
  isProcessing: boolean;                  // true during auto-run
  status: 'idle' | 'running' | 'done';

  originalScan: BrainActivityResult | null;
  modifiedScan: BrainActivityResult | null;
  proposal: LLMProposal | null;
}

interface BrainActivityResult {
  variant_id: string;
  ventral_score: number;       // 0–1
  dorsal_score: number;        // 0–1
  prefrontal_score: number;    // 0–1
  overall_engagement: number;  // 0–1
  timestamp: string;
}

interface LLMProposal {
  summary: string;
  changes: ProposedChange[];
}

interface ProposedChange {
  target: string;              // e.g. "Hero section"
  before: string;              // description of current state
  after: string;               // description of proposed change
  reasoning: string;           // neuroscience-informed rationale
}

interface ComparisonResult {
  original: BrainActivityResult;
  modified: BrainActivityResult;
  delta: number;
  uplift_pct: number;
}
```

---

## 6. Data contracts (frontend ↔ backend)

### Analyse screenshot
```typescript
// POST /analyse
// Request:  { screenshot_path: string }
// Response: BrainActivityResult
```

### Get LLM proposal
```typescript
// POST /propose
// Request:  { brain_scan: BrainActivityResult, current_variant: string }
// Response: LLMProposal
```

### Compare scans
```typescript
// POST /compare
// Request:  { original: BrainActivityResult, modified: BrainActivityResult }
// Response: ComparisonResult
```

Build against mocks until backend is live. Toggle via `VITE_USE_MOCKS=true`.

---

## 7. Design system

### Theme: dark lab interface

- Background: `#030712` (near-black)
- Surface: `#0f172a` (cards, panels)
- Border: `#1e293b`
- Text primary: `#e2e8f0`
- Text secondary: `#94a3b8`
- Text muted: `#64748b`
- Accent: cyan `#06b6d4`
- Success: emerald `#10b981`
- Warning: amber `#f59e0b`
- Danger: red `#ef4444`
- Purple: `#8b5cf6`

### Typography

- UI labels / mono: JetBrains Mono (CDN), uppercase, letter-spacing 0.1em
- Body: system sans-serif stack
- Scores / numbers: JetBrains Mono, weight 600–800
- Step titles: 16px, weight 600
- Descriptions: 13px, muted colour

### Component patterns

- Cards: `bg-[#0f172a] border border-[#1e293b] rounded-[10px] p-5`
- Score bars: 8px height, `#1e293b` track, gradient fill, 1.2s ease-out animation
- Buttons: 12px uppercase, letter-spacing 0.1em, 6px border-radius
- Browser frame: fake title bar with 3 dots + URL pill, content below

---

## 8. Acceptance criteria

### MVP

- [ ] 6-step pipeline navigable via stepper + previous/next
- [ ] "Run pipeline" auto-advances through all steps (~2s per step)
- [ ] Original site variant renders in browser frame (Golden London)
- [ ] Modified site variant renders in browser frame (Electric London)
- [ ] Brain scan bars animate on step entry
- [ ] LLM proposal shows strategy + change cards with before/after
- [ ] Verdict shows percentage uplift + region breakdown
- [ ] Works with mock data (no backend dependency)
- [ ] Laptop-width display (1280px+)

### Stretch

- [ ] Smooth step transitions (fade or slide)
- [ ] Pulse animation on stepper during auto-run
- [ ] Brain scan bars show comparative ghost bar (original score) on step 5
- [ ] Export verdict as screenshot or JSON

---

## 9. Risks

| Risk | Mitigation |
|------|------------|
| Backend not ready | Mocks are first-class. The entire demo runs on mocks. |
| Both variants look too similar in small preview | Push extremes. Black vs cream. Neon vs muted. Make it obvious at thumbnail scale. |
| Auto-run timing feels wrong | Make step duration configurable. 1.5–2.5s sweet spot for demo. |
| LLM proposal feels vague | Each change card must have a concrete before/after and a neuroscience reasoning. No hand-waving. |
| Judges don't understand the neuroscience | The verdict step does the translation: "+40% neural engagement" is self-explanatory. |