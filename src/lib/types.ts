export interface KeyMoment {
  timestamp: string
  timestampSeconds: number
  title: string
  description: string
  screenshotPath: string
}

export interface TranscriptEntry {
  start: number
  duration: number
  text: string
}

export interface VideoSummary {
  jobId: string
  videoTitle: string
  videoUrl: string
  duration: string
  tldr: string
  keyMoments: KeyMoment[]
  transcript: TranscriptEntry[]
  markdownPath: string
}

export type JobStatus =
  | { stage: 'analyzing'; message: string }
  | { stage: 'fetching-transcript'; message: string }
  | { stage: 'downloading'; message: string; progress?: number }
  | { stage: 'extracting-frames'; message: string; current?: number; total?: number }
  | { stage: 'generating'; message: string }
  | { stage: 'complete'; summary: VideoSummary }
  | { stage: 'error'; error: string }
