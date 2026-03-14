import { useState } from 'react'
import type { TranscriptEntry } from '~/lib/types'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function TranscriptPanel({ entries }: { entries: TranscriptEntry[] }) {
  const [open, setOpen] = useState(false)

  if (entries.length === 0) return null

  return (
    <div className="rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-zinc-800/50 transition cursor-pointer"
      >
        <span className="font-medium text-zinc-300">Full Transcript</span>
        <svg
          className={`w-4 h-4 text-zinc-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 max-h-96 overflow-y-auto space-y-1">
          {entries.map((entry, i) => (
            <p key={i} className="text-sm text-zinc-400">
              <span className="text-zinc-600 font-mono text-xs mr-2">
                [{formatTime(entry.start)}]
              </span>
              {entry.text}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
