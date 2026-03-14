import type { VideoSummary } from '~/lib/types'
import { SectionCard } from './section-card'
import { TranscriptPanel } from './transcript-panel'

export function SummaryView({
  summary,
  onReset,
}: {
  summary: VideoSummary
  onReset: () => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">{summary.videoTitle}</h2>
          <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500">
            <a
              href={summary.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition"
            >
              Source
            </a>
            <span>{summary.duration}</span>
          </div>
        </div>
        <button
          onClick={onReset}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition cursor-pointer"
        >
          New Summary
        </button>
      </div>

      <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-4">
        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wide mb-2">
          TL;DR
        </h3>
        <p className="text-zinc-300 leading-relaxed">{summary.tldr}</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-zinc-200 mb-4">Key Moments</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {summary.keyMoments.map((moment, i) => (
            <SectionCard key={i} moment={moment} index={i} />
          ))}
        </div>
      </div>

      <TranscriptPanel entries={summary.transcript} />
    </div>
  )
}
