import { createFileRoute } from '@tanstack/react-router'
import { subscribe } from '~/lib/job-store'
import type { JobStatus } from '~/lib/types'

export const Route = createFileRoute('/api/progress/$jobId')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const encoder = new TextEncoder()
        const stream = new ReadableStream({
          start(controller) {
            const unsubscribe = subscribe(params.jobId, (status: JobStatus) => {
              try {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(status)}\n\n`))
                if (status.stage === 'complete' || status.stage === 'error') {
                  setTimeout(() => {
                    try {
                      controller.close()
                    } catch {}
                  }, 100)
                }
              } catch {}
            })
          },
        })

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        })
      },
    },
  },
})
