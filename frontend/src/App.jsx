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
