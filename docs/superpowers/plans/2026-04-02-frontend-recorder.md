# Frontend Recorder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Vite + React single-page app that submits a URL to `POST /record`, shows a loading state, then displays success (file path) or error.

**Architecture:** One React component (`App.jsx`) manages all state with `useState`. A Vite dev proxy rewrites `/record` to `http://localhost:8000` so no CORS config is needed on the backend.

**Tech Stack:** Vite, React 18, Vitest, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom

---

## File Map

| File | Responsibility |
|---|---|
| `frontend/package.json` | Dependencies and scripts |
| `frontend/vite.config.js` | Dev server proxy + Vitest config |
| `frontend/index.html` | HTML entry point |
| `frontend/src/main.jsx` | React root mount |
| `frontend/src/App.jsx` | URL form, fetch logic, state display |
| `frontend/src/App.test.jsx` | Component tests (Vitest + RTL) |

---

## Task 1: Scaffold the project

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.js`
- Create: `frontend/index.html`
- Create: `frontend/src/main.jsx`

- [ ] **Step 1: Create `frontend/package.json`**

```json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.2",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.2",
    "@vitejs/plugin-react": "^4.3.0",
    "jsdom": "^24.1.0",
    "vite": "^5.3.0",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: Create `frontend/vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/record': 'http://localhost:8000',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
  },
})
```

- [ ] **Step 3: Create `frontend/src/setupTests.js`**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 4: Create `frontend/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Recorder</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create `frontend/src/main.jsx`**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
```

- [ ] **Step 6: Install dependencies**

```bash
cd frontend
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 7: Commit**

```bash
git add frontend/
git commit -m "chore: scaffold frontend Vite React project"
```

---

## Task 2: Implement App.jsx (TDD)

**Files:**
- Create: `frontend/src/App.test.jsx`
- Create: `frontend/src/App.jsx`

- [ ] **Step 1: Write failing tests**

Create `frontend/src/App.test.jsx`:

```jsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from './App.jsx'

describe('App', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders URL input and Record button', () => {
    render(<App />)
    expect(screen.getByPlaceholderText('https://example.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Record' })).toBeInTheDocument()
  })

  it('disables input and button while recording', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ file: 'recordings/abc.webm' }),
    })

    render(<App />)
    const input = screen.getByPlaceholderText('https://example.com')
    const button = screen.getByRole('button', { name: 'Record' })

    await userEvent.type(input, 'https://example.com')
    await userEvent.click(button)

    expect(button).toBeDisabled()
    expect(input).toBeDisabled()
  })

  it('shows success message with file path on completion', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ file: 'recordings/abc.webm' }),
    })

    render(<App />)
    await userEvent.type(screen.getByPlaceholderText('https://example.com'), 'https://example.com')
    await userEvent.click(screen.getByRole('button', { name: 'Record' }))

    await waitFor(() =>
      expect(screen.getByText(/Done! Saved to: recordings\/abc\.webm/)).toBeInTheDocument()
    )
  })

  it('shows error message when fetch fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'browser crashed' }),
    })

    render(<App />)
    await userEvent.type(screen.getByPlaceholderText('https://example.com'), 'https://example.com')
    await userEvent.click(screen.getByRole('button', { name: 'Record' }))

    await waitFor(() =>
      expect(screen.getByText(/browser crashed/)).toBeInTheDocument()
    )
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd frontend
npm test
```

Expected: `Cannot find module './App.jsx'`

- [ ] **Step 3: Implement `frontend/src/App.jsx`**

```jsx
import { useState } from 'react'

export default function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await fetch('/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.detail || 'Something went wrong')
      } else {
        setResult(data.file)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '80px auto', fontFamily: 'sans-serif' }}>
      <h1>Recorder</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          disabled={loading}
          required
          style={{ width: '100%', padding: 8, marginBottom: 8, boxSizing: 'border-box' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
          {loading ? 'Recording…' : 'Record'}
        </button>
      </form>

      {result && (
        <p style={{ color: 'green', marginTop: 16 }}>
          Done! Saved to: {result}
        </p>
      )}

      {error && (
        <p style={{ color: 'red', marginTop: 16 }}>
          Error: {error}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd frontend
npm test
```

Expected:
```
✓ renders URL input and Record button
✓ disables input and button while recording
✓ shows success message with file path on completion
✓ shows error message when fetch fails

Test Files  1 passed (1)
Tests       4 passed (4)
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/App.jsx frontend/src/App.test.jsx frontend/src/setupTests.js
git commit -m "feat: add recorder frontend UI"
```

---

## Task 3: Smoke test (manual)

- [ ] **Step 1: Start the backend** (in one terminal)

```bash
cd backend
.venv/bin/uvicorn main:app --reload
```

- [ ] **Step 2: Start the frontend** (in another terminal)

```bash
cd frontend
npm run dev
```

Expected: `Local: http://localhost:5173/`

- [ ] **Step 3: Open the browser**

Go to `http://localhost:5173`, enter a URL, click Record. After a few seconds you should see the green success message with the file path.
