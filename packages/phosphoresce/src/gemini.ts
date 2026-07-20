import { GoogleGenAI } from '@google/genai'

export const DEFAULT_MODEL = 'gemini-3.5-flash'

let _ai: GoogleGenAI | null = null
function getAI(): GoogleGenAI {
  if (!_ai) {
    const key = process.env.GEMINI_API_KEY
    if (!key) throw new Error('GEMINI_API_KEY is not set.')
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

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    videoTitle: { type: 'string' },
    duration: { type: 'string', description: 'MM:SS or H:MM:SS format' },
    tldr: { type: 'string', description: '2-3 sentence overall summary' },
    keyMoments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          timestamp: { type: 'string', description: 'M:SS or H:MM:SS format' },
          timestampSeconds: { type: 'number' },
          title: { type: 'string', description: 'short section title' },
          description: { type: 'string', description: '1-2 sentence description of what happens' },
        },
        required: ['timestamp', 'timestampSeconds', 'title', 'description'],
      },
    },
  },
  required: ['videoTitle', 'duration', 'tldr', 'keyMoments'],
}

const PROMPT = `Analyze this video and provide a structured summary.

Requirements:
- Identify key moments spread across the video: 5-8 for videos under 5 minutes, 8-15 under 30 minutes, 15-25 for longer videos
- Timestamps must be accurate, in chronological order, and within the video's duration
- Each key moment should capture a distinct topic/section change
- The tldr should capture the main thesis/takeaway
- timestampSeconds must be the timestamp converted to total seconds`

export async function analyzeVideo(videoUrl: string, model: string = DEFAULT_MODEL): Promise<GeminiAnalysis> {
  const response = await getAI().models.generateContent({
    model,
    contents: [
      {
        role: 'user',
        parts: [
          { fileData: { fileUri: videoUrl } },
          { text: PROMPT },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseJsonSchema: RESPONSE_SCHEMA,
    },
  })

  const analysis = JSON.parse(response.text ?? '') as GeminiAnalysis
  if (!Array.isArray(analysis.keyMoments) || analysis.keyMoments.length === 0) {
    throw new Error('Video analysis returned no key moments')
  }
  return analysis
}
