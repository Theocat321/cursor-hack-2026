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
