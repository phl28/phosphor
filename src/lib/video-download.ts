import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const execFileAsync = promisify(execFile)

export async function downloadVideo(
  videoUrl: string,
  jobId: string,
  onProgress?: (pct: number) => void,
): Promise<string> {
  const dir = path.resolve('storage/videos')
  await mkdir(dir, { recursive: true })
  const outputPath = path.join(dir, `${jobId}.mp4`)

  try {
    await execFileAsync('yt-dlp', [
      '-f', 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best',
      '--merge-output-format', 'mp4',
      '-o', outputPath,
      '--no-playlist',
      videoUrl,
    ], { timeout: 5 * 60 * 1000 })
  } catch (err: any) {
    throw new Error(`yt-dlp failed: ${err.stderr || err.message}`)
  }

  return outputPath
}
