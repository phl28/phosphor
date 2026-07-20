import { mkdir, writeFile, unlink } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import { analyzeVideo, DEFAULT_MODEL } from './gemini.js'
import { fetchTranscript } from './transcript.js'
import { downloadVideo } from './video-download.js'
import { extractFrames } from './frame-extractor.js'
import { generateMarkdown } from './markdown-generator.js'
import type { VideoSummary, KeyMoment, ProgressStatus } from './types.js'

const execFileAsync = promisify(execFile)

async function binaryExists(name: string): Promise<boolean> {
  try {
    await execFileAsync('which', [name])
    return true
  } catch {
    return false
  }
}

export interface SummarizeOptions {
  jobId: string
  /** Per-job directory where screenshots/ and summary.md are written. */
  outputDir: string
  /** Directory for temporarily downloaded videos (deleted after frame extraction). */
  videoDir: string
  /** Gemini model ID. Must support video input. */
  model?: string
  onProgress?: (status: ProgressStatus) => void
}

/**
 * Runs the full summarization pipeline. Returns a VideoSummary whose
 * screenshotPath/markdownPath values are relative to outputDir; callers map
 * them to their own URL space. Requires GEMINI_API_KEY; yt-dlp and ffmpeg
 * are optional (without them the summary has no screenshots).
 */
export async function summarizeVideo(videoUrl: string, options: SummarizeOptions): Promise<VideoSummary> {
  const { jobId, outputDir, videoDir, model = DEFAULT_MODEL } = options
  const onProgress = options.onProgress ?? (() => {})

  await mkdir(outputDir, { recursive: true })

  onProgress({ stage: 'analyzing', message: 'Analyzing video with AI...' })
  const [analysis, transcript] = await Promise.all([
    analyzeVideo(videoUrl, model),
    fetchTranscript(videoUrl).catch(() => {
      onProgress({ stage: 'fetching-transcript', message: 'No captions available, continuing without transcript' })
      return []
    }),
  ])

  const hasYtDlp = await binaryExists('yt-dlp')
  const hasFfmpeg = await binaryExists('ffmpeg')

  let videoPath: string | null = null
  if (hasYtDlp && hasFfmpeg) {
    onProgress({ stage: 'downloading', message: 'Downloading video for screenshots...' })
    try {
      videoPath = await downloadVideo(videoUrl, path.join(videoDir, `${jobId}.mp4`), (pct) => {
        onProgress({ stage: 'downloading', message: `Downloading... ${pct}%`, progress: pct })
      })
    } catch {
      onProgress({ stage: 'downloading', message: 'Download failed, continuing without screenshots' })
    }
  } else {
    const missing = [!hasYtDlp && 'yt-dlp', !hasFfmpeg && 'ffmpeg'].filter(Boolean).join(', ')
    onProgress({ stage: 'downloading', message: `${missing} not found — skipping screenshots.` })
  }

  let screenshotPaths: string[] = []
  if (videoPath) {
    onProgress({
      stage: 'extracting-frames',
      message: 'Extracting screenshots...',
      current: 0,
      total: analysis.keyMoments.length,
    })
    screenshotPaths = await extractFrames(
      videoPath,
      analysis.keyMoments.map((m) => m.timestampSeconds),
      outputDir,
      (current, total) => {
        onProgress({
          stage: 'extracting-frames',
          message: `Extracting frame ${current}/${total}`,
          current,
          total,
        })
      },
    )

    try {
      await unlink(videoPath)
    } catch {}
  }

  onProgress({ stage: 'generating', message: 'Generating summary...' })

  const keyMoments: KeyMoment[] = analysis.keyMoments.map((m, i) => ({
    timestamp: m.timestamp,
    timestampSeconds: m.timestampSeconds,
    title: m.title,
    description: m.description,
    screenshotPath: screenshotPaths[i] || '',
  }))

  const summary: VideoSummary = {
    jobId,
    videoTitle: analysis.videoTitle,
    videoUrl,
    duration: analysis.duration,
    tldr: analysis.tldr,
    keyMoments,
    transcript,
    markdownPath: 'summary.md',
  }

  await writeFile(path.join(outputDir, 'summary.md'), generateMarkdown(summary), 'utf-8')

  return summary
}
