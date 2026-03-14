import { getSubtitles } from 'youtube-caption-extractor'
import type { TranscriptEntry } from './types'

function extractVideoId(url: string): string | null {
  const patterns = [
    /[?&]v=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /shorts\/([\w-]{11})/,
  ]
  for (const p of patterns) {
    const match = url.match(p)
    if (match) return match[1]
  }
  return null
}

export async function fetchTranscript(videoUrl: string): Promise<TranscriptEntry[]> {
  const videoId = extractVideoId(videoUrl)
  if (!videoId) return []

  try {
    const subtitles = await getSubtitles({ videoID: videoId, lang: 'en' })
    return subtitles.map((s) => ({
      start: parseFloat(s.start),
      duration: parseFloat(s.dur),
      text: s.text,
    }))
  } catch {
    return []
  }
}
