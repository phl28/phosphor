import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

export async function downloadVideo(
  videoUrl: string,
  outputPath: string,
  onProgress?: (pct: number) => void,
): Promise<string> {
  await mkdir(path.dirname(outputPath), { recursive: true })

  await new Promise<void>((resolve, reject) => {
    const proc = spawn(
      'yt-dlp',
      [
        '-f', 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best',
        '--merge-output-format', 'mp4',
        '--newline',
        '--no-playlist',
        '-o', outputPath,
        videoUrl,
      ],
      { timeout: 5 * 60 * 1000 },
    )

    let stderr = ''
    let lastPct = -1
    proc.stdout.on('data', (chunk: Buffer) => {
      const match = /\[download\]\s+(\d+(?:\.\d+)?)%/.exec(chunk.toString())
      if (match) {
        const pct = Math.floor(parseFloat(match[1]))
        if (pct !== lastPct) {
          lastPct = pct
          onProgress?.(pct)
        }
      }
    })
    proc.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString()
    })
    proc.on('error', reject)
    proc.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`yt-dlp failed: ${stderr.trim() || `exit code ${code}`}`))
    })
  })

  return outputPath
}
