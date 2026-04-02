# Cross-Section UI Migration Design

**Date:** 2026-04-02  
**Status:** Approved

## Goal

Replace the minimal form-based `frontend/` with the polished 6-step animated pipeline UI from `cross-section-ui/`, wired to the real backend at `http://localhost:8000`.

## Architecture

### Files migrated (cross-section-ui → frontend/src)
- `App.tsx` → `App.jsx` — main 6-step pipeline flow (left panel variants, right panel step output)
- `shared.tsx` → `shared.jsx` — `usePipeline` hook, rewired for real backend
- `components/WebsiteRecordingDisplay.tsx` → `.jsx` — mini site preview
- `components/ProgressStepper.tsx` → `.jsx` — step progress bar
- `steps/RecordWebsiteStep.tsx` → `.jsx` — URL input + launch
- `steps/TribeProcessingStep.tsx` → `.jsx` — brain scan loading state
- `steps/OutcomeStep.tsx` → `.jsx` — brain scan image display
- `steps/SuggestVariantStep.tsx` → `.jsx` — variant generation status
- `steps/CompareStep.tsx` → `.jsx` — lateral vs medial brain scan comparison
- `steps/LoopStep.tsx` → `.jsx` — preview iframes (both variants)
- `index.css` — merged into existing frontend CSS

### Files deleted / not migrated
- `mocks/data.ts` — replaced by real backend data
- `types/index.ts` — TypeScript types, not needed in JSX
- `components/BrainImageDisplay.tsx` — replaced: real backend returns base64 PNG images, not SVG mock scores

### Files kept from frontend
- `vite.config.js` — Vite proxy to `:8000` retained; add react-router-dom
- `main.jsx` — add `<BrowserRouter>` wrapper
- `App.test.jsx`, `setupTests.js` — kept, update tests later
- `PreviewPage.jsx` — removed (replaced by LoopStep)

### Packages added
- `react-router-dom` (v7) to `frontend/package.json`

## Real Backend Response Shape

`POST /pipeline` returns:
```json
{
  "file": "...",
  "result": { "preds": [...], "segments": [...] },
  "branches": ["llm-changes-{ts}-v1", "llm-changes-{ts}-v2"],
  "preview_urls": ["http://localhost:6005", "http://localhost:6006"],
  "brain_results": ["<lateral_view_png_base64>", "<medial_view_png_base64>"]
}
```

Key facts:
- `brain_results` = **two views of the original scan only** (lateral + medial), NOT one scan per variant
- `preview_urls` = two live Vite preview servers for the LLM-generated variants
- No suggestion text is returned — LLM applies changes directly to files; variants are labelled "Design A" / "Design B"
- The backend does NOT scan the LLM-generated variants (only the original is scanned)

## API Wiring

### The key mismatch
cross-section-ui simulates each step with fake timeouts. The real backend does everything in a single `POST /pipeline` call (~30–60s). Resolution: fire the backend call when the user clicks "Run", animate steps as loading states while waiting, then populate with real data when the response arrives.

### Step-by-step mapping

| Step | cross-section-ui (mock) | Real wiring |
|------|------------------------|-------------|
| RecordWebsiteStep | fake 2.5s delay | fires `POST /pipeline { url, style_guidelines }` |
| TribeProcessingStep | fake scan animation | loading state while request is in-flight |
| OutcomeStep | mock SVG brain + scores | `<img>` tag with `brain_results[0]` (lateral PNG) |
| SuggestVariantStep | cascading mock LLM text | "Generating Design A & B..." — no suggestion text from backend |
| CompareStep | mock second SVG scan | `<img>` tags for `brain_results[0]` (lateral) + `brain_results[1]` (medial) |
| LoopStep | mock uplift %, restart | iframes of `preview_urls[0]` + `preview_urls[1]`, labelled Design A / Design B |

### Endpoints used
- `POST /pipeline` — `{ url, style_guidelines? }` → full pipeline response
- `POST /pipeline/resume` — no body → skip recording+inference, reuse cached result
- `GET /test` — no body → load 2 pre-made test variants, jump straight to LoopStep

## Style Guidelines
- Text area in RecordWebsiteStep (or separate settings panel)
- Persisted in `localStorage` key `styleGuidelines`
- Sent as optional field in `POST /pipeline` body

## Routing
- `/` → main App pipeline flow
- `/c` → LayoutC (three-row dashboard) — migrated as hidden route for reference
- Layouts A and B are not migrated
