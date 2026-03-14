import { GoogleGenAI } from '@google/genai'

let _ai: GoogleGenAI | null = null
function getAI(): GoogleGenAI {
  if (!_ai) {
    const key = process.env.GEMINI_API_KEY
    if (!key) throw new Error('GEMINI_API_KEY is not set. Add it to your .env file.')
    _ai = new GoogleGenAI({ apiKey: key })
  }
  return _ai
}

export interface GeminiMoment {
  timestamp: string
  timestampSeconds: number
  title: string
  description: string
}

export interface GeminiAnalysis {
  videoTitle: string
  duration: string
  tldr: string
  keyMoments: GeminiMoment[]
}

function buildPrompt(videoUrl: string, durationHint?: string): string {
  const momentRange = !durationHint
    ? '8-15'
    : parseDuration(durationHint) < 300
      ? '5-8'
      : parseDuration(durationHint) < 1800
        ? '8-15'
        : parseDuration(durationHint) < 7200
          ? '15-25'
          : '20-30'

  return `Analyze this YouTube video and provide a structured summary.

Return a JSON object with this exact structure (no markdown, no code fences, just raw JSON):
{
  "videoTitle": "the video title",
  "duration": "MM:SS or H:MM:SS format",
  "tldr": "2-3 sentence overall summary",
  "keyMoments": [
    {
      "timestamp": "M:SS",
      "timestampSeconds": 0,
      "title": "short section title",
      "description": "1-2 sentence description of what happens"
    }
  ]
}

Requirements:
- Identify ${momentRange} key moments spread across the video
- Timestamps must be accurate and in chronological order
- Each key moment should capture a distinct topic/section change
- The tldr should capture the main thesis/takeaway
- timestampSeconds must be the timestamp converted to total seconds

Video URL: ${videoUrl}`
}

function parseDuration(d: string): number {
  const parts = d.split(':').map(Number)
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return parts[0] ?? 0
}

export async function analyzeVideo(videoUrl: string): Promise<GeminiAnalysis> {
  const response = await getAI().models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: buildPrompt(videoUrl) },
        ],
      },
    ],
  })

  const text = response.text?.trim() ?? ''
  const cleaned = text.replace(/^```json\s*/, '').replace(/```\s*$/, '')
  return JSON.parse(cleaned) as GeminiAnalysis
}
