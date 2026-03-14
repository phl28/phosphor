import type { VideoSummary } from './types'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function generateMarkdown(summary: VideoSummary): string {
  const lines: string[] = []

  lines.push(`# ${summary.videoTitle}`)
  lines.push('')
  lines.push(`> **Source:** [${summary.videoUrl}](${summary.videoUrl})`)
  lines.push(`> **Duration:** ${summary.duration}`)
  lines.push('')
  lines.push('## TL;DR')
  lines.push('')
  lines.push(summary.tldr)
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('## Key Moments')
  lines.push('')

  for (let i = 0; i < summary.keyMoments.length; i++) {
    const m = summary.keyMoments[i]
    lines.push(`### ${i + 1}. ${m.title} (${m.timestamp})`)
    lines.push('')
    lines.push(m.description)
    lines.push('')
    if (m.screenshotPath) {
      lines.push(`![${m.timestamp}](${m.screenshotPath})`)
      lines.push('')
    }
  }

  if (summary.transcript.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push('## Transcript')
    lines.push('')
    lines.push('<details>')
    lines.push('<summary>Full transcript</summary>')
    lines.push('')
    for (const entry of summary.transcript) {
      lines.push(`**[${formatTime(entry.start)}]** ${entry.text}`)
      lines.push('')
    }
    lines.push('</details>')
  }

  return lines.join('\n')
}
