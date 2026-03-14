import type { JobStatus } from '~/lib/types'

const STAGE_LABELS: Record<string, string> = {
  analyzing: 'Analyzing video with AI',
  'fetching-transcript': 'Fetching transcript',
  downloading: 'Downloading video',
  'extracting-frames': 'Extracting screenshots',
  generating: 'Generating summary',
}

export function ProgressTracker({ status }: { status: JobStatus }) {
  if (status.stage === 'error') {
    return (
      <div className="rounded-lg bg-red-950/50 border border-red-900 p-4 mb-8">
        <p className="text-red-400 font-medium">Error</p>
        <p className="text-red-300 text-sm mt-1">{status.error}</p>
      </div>
    )
  }

  const label = STAGE_LABELS[status.stage] ?? status.message

  return (
    <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-4 mb-8">
      <div className="flex items-center gap-3">
        <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <span className="text-zinc-300 font-medium">{label}</span>
      </div>
      {status.stage === 'downloading' && status.progress != null && (
        <div className="mt-3 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${status.progress}%` }}
          />
        </div>
      )}
      {status.stage === 'extracting-frames' && status.current != null && status.total != null && (
        <p className="mt-2 text-sm text-zinc-500">
          Frame {status.current} of {status.total}
        </p>
      )}
      <p className="mt-2 text-sm text-zinc-500">{status.message}</p>
    </div>
  )
}
