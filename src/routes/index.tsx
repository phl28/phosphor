import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { UrlInput } from '~/components/url-input'
import { ProgressTracker } from '~/components/progress-tracker'
import { SummaryView } from '~/components/summary-view'
import type { JobStatus, VideoSummary } from '~/lib/types'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const [jobId, setJobId] = useState<string | null>(null)
  const [status, setStatus] = useState<JobStatus | null>(null)
  const [summary, setSummary] = useState<VideoSummary | null>(null)

  async function handleSubmit(url: string) {
    setSummary(null)
    setStatus({ stage: 'analyzing', message: 'Starting...' })

    const res = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setStatus({ stage: 'error', error: body.error || 'Failed to start summarization' })
      return
    }

    const { jobId: id } = await res.json()
    setJobId(id)

    const evtSource = new EventSource(`/api/progress/${id}`)
    evtSource.onmessage = (event) => {
      const data: JobStatus = JSON.parse(event.data)
      setStatus(data)
      if (data.stage === 'complete') {
        setSummary(data.summary)
        evtSource.close()
      }
      if (data.stage === 'error') {
        evtSource.close()
      }
    }
    evtSource.onerror = () => {
      setStatus({ stage: 'error', error: 'Lost connection to server' })
      evtSource.close()
    }
  }

  function handleReset() {
    setJobId(null)
    setStatus(null)
    setSummary(null)
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Video Summarizer
        </h1>
        <p className="text-zinc-400 text-lg">
          Paste a YouTube URL to get a visual summary with screenshots
        </p>
      </header>

      <UrlInput
        onSubmit={handleSubmit}
        disabled={!!status && status.stage !== 'complete' && status.stage !== 'error'}
      />

      {status && status.stage !== 'complete' && (
        <ProgressTracker status={status} />
      )}

      {summary && (
        <SummaryView summary={summary} onReset={handleReset} />
      )}
    </main>
  )
}
