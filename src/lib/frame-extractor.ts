import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const execFileAsync = promisify(execFile)

export async function extractFrames(
  videoPath: string,
  timestamps: number[],
  outputDir: string,
  onProgress?: (current: number, total: number) => void,
): Promise<string[]> {
  const screenshotDir = path.join(outputDir, 'screenshots')
  await mkdir(screenshotDir, { recursive: true })

  const paths: string[] = []

  for (let i = 0; i < timestamps.length; i++) {
    const ts = timestamps[i]
    const filename = `frame-${String(i + 1).padStart(3, '0')}.jpg`
    const outPath = path.join(screenshotDir, filename)

    try {
      await execFileAsync('ffmpeg', [
        '-ss', String(ts),
        '-i', videoPath,
        '-frames:v', '1',
        '-q:v', '2',
        '-y',
        outPath,
      ], { timeout: 30_000 })
      paths.push(`./screenshots/${filename}`)
    } catch {
      paths.push('')
    }

    onProgress?.(i + 1, timestamps.length)
  }

  return paths
}
