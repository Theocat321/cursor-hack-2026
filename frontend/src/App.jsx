import { useEffect, useState } from 'react'

const STYLE_GUIDELINES_KEY = 'recorder-style-guidelines'

function loadGuidelines() {
  try {
    return localStorage.getItem(STYLE_GUIDELINES_KEY) ?? ''
  } catch {
    return ''
  }
}

export default function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [styleGuidelines, setStyleGuidelines] = useState(loadGuidelines)

  const [testLoading, setTestLoading] = useState(false)
  const [testError, setTestError] = useState(null)
  const [testPayload, setTestPayload] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem(STYLE_GUIDELINES_KEY, styleGuidelines)
    } catch {
      /* ignore quota / private mode */
    }
  }, [styleGuidelines])

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

  async function handleTestComparison() {
    setTestLoading(true)
    setTestError(null)
    setTestPayload(null)

    try {
      const res = await fetch('/test')
      const data = await res.json()

      if (!res.ok) {
        setTestError(data.detail || 'Test request failed')
      } else {
        setTestPayload(data)
      }
    } catch (err) {
      setTestError(err.message)
    } finally {
      setTestLoading(false)
    }
  }

  const variants = testPayload?.variants ?? []

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
      <div
        className={`mx-auto px-4 py-12 sm:py-16 ${variants.length ? 'max-w-6xl' : 'max-w-lg'}`}
      >
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-800 sm:text-4xl">
            Recorder
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Capture a URL session and save the recording.
          </p>
        </header>

        <section
          className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/60"
          aria-labelledby="style-guidelines-heading"
        >
          <h2
            id="style-guidelines-heading"
            className="text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            Style guidelines
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Describe typography, color, spacing, or tone. Saved in this browser and meant to guide
            frontend changes.
          </p>
          <label htmlFor="style-guidelines" className="sr-only">
            User style guidelines for the frontend
          </label>
          <textarea
            id="style-guidelines"
            value={styleGuidelines}
            onChange={(e) => setStyleGuidelines(e.target.value)}
            placeholder="e.g. Prefer a calm editorial look: plenty of whitespace, serif headings, accent #2563eb, no harsh borders…"
            rows={5}
            className="mt-3 w-full resize-y rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
          />
        </section>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="record-url" className="mb-1.5 block text-sm font-medium text-slate-700">
                Page URL
              </label>
              <input
                id="record-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={loading}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400/30 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[7rem]"
              >
                {loading ? 'Recording…' : 'Record'}
              </button>
              <button
                type="button"
                onClick={handleTestComparison}
                disabled={testLoading}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {testLoading ? 'Loading test…' : 'Test comparison (2 previews)'}
              </button>
            </div>
          </form>

          {result && (
            <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
              Done! Saved to: <span className="font-mono text-emerald-950">{result}</span>
            </p>
          )}

          {error && (
            <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
              Error: {error}
            </p>
          )}

          {testError && (
            <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
              Test error: {testError}
            </p>
          )}
        </div>

        {variants.length > 0 && (
          <section
            className="mt-10"
            aria-label="Comparison previews and brain activation maps"
          >
            <h2 className="mb-4 text-center text-lg font-semibold text-slate-800">
              Side-by-side previews
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {variants.map((v) => (
                <article
                  key={v.id}
                  className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-200/50"
                >
                  <div className="border-b border-slate-100 px-4 py-3">
                    <h3 className="text-sm font-semibold text-slate-800">{v.title}</h3>
                    <p className="text-xs text-slate-500">Activation map (demo) + embedded preview</p>
                  </div>
                  <div className="flex flex-col gap-3 p-4">
                    <div className="flex justify-center rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200/80">
                      <img
                        src={v.brainImageUrl}
                        alt={`Demo brain activation for ${v.title}`}
                        className="h-36 w-auto max-w-full object-contain"
                        width={240}
                        height={200}
                      />
                    </div>
                    <div className="overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/80">
                      <iframe
                        title={`Preview ${v.id}`}
                        src={v.iframeUrl}
                        className="h-[min(22rem,50vh)] w-full border-0 bg-white"
                        sandbox="allow-same-origin allow-scripts"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {testPayload?.tribeNote && (
              <p className="mt-6 rounded-xl border border-amber-100 bg-amber-50/90 px-4 py-3 text-xs leading-relaxed text-amber-950">
                <strong className="font-semibold">TRIBE v2:</strong> {testPayload.tribeNote}
              </p>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
