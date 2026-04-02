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
    let resolveFetch
    vi.spyOn(global, 'fetch').mockReturnValueOnce(
      new Promise((res) => { resolveFetch = res })
    )

    render(<App />)
    const input = screen.getByPlaceholderText('https://example.com')
    const button = screen.getByRole('button', { name: 'Record' })

    await userEvent.type(input, 'https://example.com')
    userEvent.click(button) // intentionally not awaited — fetch is pending

    await waitFor(() => expect(button).toBeDisabled())
    expect(input).toBeDisabled()

    // clean up — resolve the pending fetch
    resolveFetch({ ok: true, json: async () => ({ file: 'recordings/abc.webm' }) })
  })

  it('shows success message with file path on completion', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ file: 'recordings/abc.webm' }),
    })

    render(<App />)
    await userEvent.type(screen.getByPlaceholderText('https://example.com'), 'https://example.com')
    await userEvent.click(screen.getByRole('button', { name: 'Record' }))

    await waitFor(() => {
      expect(screen.getByText('Done! Saved to:')).toBeInTheDocument()
      expect(screen.getByText('recordings/abc.webm')).toBeInTheDocument()
    })
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

  it('loads test comparison and shows two preview panes', async () => {
    const testBody = {
      variants: [
        {
          id: 'a',
          title: 'Version A',
          iframeUrl: '/test-preview/a',
          brainImageUrl: 'data:image/svg+xml;base64,PHN2Zy8+',
        },
        {
          id: 'b',
          title: 'Version B',
          iframeUrl: '/test-preview/b',
          brainImageUrl: 'data:image/svg+xml;base64,PHN2Zy8+',
        },
      ],
      tribeNote: 'TRIBE note for tests.',
    }

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => testBody,
    })

    render(<App />)
    await userEvent.click(
      screen.getByRole('button', { name: 'Test comparison (2 previews)' })
    )

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /side-by-side previews/i })).toBeInTheDocument()
      expect(screen.getByTitle('Preview a')).toBeInTheDocument()
      expect(screen.getByTitle('Preview b')).toBeInTheDocument()
      expect(screen.getByText(/TRIBE note for tests/)).toBeInTheDocument()
    })
  })

  it('renders Run Pipeline button', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'Run Pipeline' })).toBeInTheDocument()
  })

  it('shows PreviewPage when pipeline succeeds', async () => {
    const pipelineResponse = {
      file: 'recordings/abc.webm',
      result: { preds: [[0.1]], segments: [] },
      branches: ['llm-changes-100-v1', 'llm-changes-100-v2'],
      preview_urls: ['http://localhost:6005', 'http://localhost:6006'],
      brain_results: [
        { preds: [[0.2]], segments: [] },
        { preds: [[0.3]], segments: [] },
      ],
    }

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => pipelineResponse,
    })

    render(<App />)
    await userEvent.type(screen.getByPlaceholderText('https://example.com'), 'https://example.com')
    await userEvent.click(screen.getByRole('button', { name: 'Run Pipeline' }))

    await waitFor(() => {
      expect(screen.getByTitle('V1 Conservative')).toBeInTheDocument()
      expect(screen.getByTitle('V2 Bold Redesign')).toBeInTheDocument()
      expect(screen.getByText('Brain V1')).toBeInTheDocument()
      expect(screen.getByText('Brain V2')).toBeInTheDocument()
    })
  })

  it('shows pipeline error when pipeline fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: 'pipeline exploded' }),
    })

    render(<App />)
    await userEvent.type(screen.getByPlaceholderText('https://example.com'), 'https://example.com')
    await userEvent.click(screen.getByRole('button', { name: 'Run Pipeline' }))

    await waitFor(() =>
      expect(screen.getByText(/pipeline exploded/)).toBeInTheDocument()
    )
  })
})
