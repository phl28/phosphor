import { mkdir, writeFile, unlink } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'

const execFileAsync = promisify(execFile)

async function binaryExists(name: string): Promise<boolean> {
  try {
    await execFileAsync('which', [name])
    return true
  } catch {
    return false
  }
}
import { updateJob } from './job-store'
import { analyzeVideo } from './gemini'
import { fetchTranscript } from './transcript'
import { downloadVideo } from './video-download'
import { extractFrames } from './frame-extractor'
import { generateMarkdown } from './markdown-generator'
import type { VideoSummary, KeyMoment } from './types'

export async function runPipeline(jobId: string, videoUrl: string) {
  try {
    const outputDir = path.resolve('output', jobId)
    await mkdir(outputDir, { recursive: true })

    updateJob(jobId, { stage: 'analyzing', message: 'Analyzing video with AI...' })
    const [analysis, transcript] = await Promise.all([
      analyzeVideo(videoUrl),
      fetchTranscript(videoUrl).catch(() => {
        updateJob(jobId, { stage: 'fetching-transcript', message: 'No captions available, continuing without transcript' })
        return []
      }),
    ])

    const hasYtDlp = await binaryExists('yt-dlp')
    const hasFfmpeg = await binaryExists('ffmpeg')

    let videoPath: string | null = null
    if (hasYtDlp && hasFfmpeg) {
      updateJob(jobId, { stage: 'downloading', message: 'Downloading video for screenshots...' })
      try {
        videoPath = await downloadVideo(videoUrl, jobId, (pct) => {
          updateJob(jobId, { stage: 'downloading', message: `Downloading... ${pct}%`, progress: pct })
        })
      } catch (err: any) {
        updateJob(jobId, { stage: 'downloading', message: 'Download failed, continuing without screenshots' })
      }
    } else {
      const missing = [!hasYtDlp && 'yt-dlp', !hasFfmpeg && 'ffmpeg'].filter(Boolean).join(', ')
      updateJob(jobId, { stage: 'downloading', message: `${missing} not found — skipping screenshots. Run \`devbox shell\` to get them.` })
    }

    let screenshotPaths: string[] = []
    if (videoPath) {
      updateJob(jobId, {
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
          updateJob(jobId, {
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

    updateJob(jobId, { stage: 'generating', message: 'Generating summary...' })

    const keyMoments: KeyMoment[] = analysis.keyMoments.map((m, i) => ({
      timestamp: m.timestamp,
      timestampSeconds: m.timestampSeconds,
      title: m.title,
      description: m.description,
      screenshotPath: screenshotPaths[i]
        ? `/output/${jobId}/screenshots/${path.basename(screenshotPaths[i])}`
        : '',
    }))

    const summary: VideoSummary = {
      jobId,
      videoTitle: analysis.videoTitle,
      videoUrl,
      duration: analysis.duration,
      tldr: analysis.tldr,
      keyMoments,
      transcript,
      markdownPath: `/output/${jobId}/summary.md`,
    }

    const markdownKeyMoments: KeyMoment[] = analysis.keyMoments.map((m, i) => ({
      ...m,
      screenshotPath: screenshotPaths[i] || '',
    }))

    const markdownSummary: VideoSummary = {
      ...summary,
      keyMoments: markdownKeyMoments,
    }

    const markdown = generateMarkdown(markdownSummary)
    await writeFile(path.join(outputDir, 'summary.md'), markdown, 'utf-8')

    updateJob(jobId, { stage: 'complete', summary })
  } catch (err: any) {
    updateJob(jobId, { stage: 'error', error: err.message || 'Unknown error' })
  }
}
