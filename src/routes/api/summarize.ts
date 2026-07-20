import { createFileRoute } from '@tanstack/react-router'
import { createJob } from '~/lib/job-store'
import { runPipeline } from '~/lib/summarizer'
import { extractVideoId } from '~/lib/transcript'

export const Route = createFileRoute('/api/summarize')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json()
        const url = body?.url

        if (!url || typeof url !== 'string' || !extractVideoId(url)) {
          return Response.json({ error: 'Missing or invalid YouTube URL' }, { status: 400 })
        }

        if (!process.env.GEMINI_API_KEY) {
          return Response.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
        }

        const jobId = crypto.randomUUID()
        createJob(jobId)

        runPipeline(jobId, url)

        return Response.json({ jobId })
      },
    },
  },
})
