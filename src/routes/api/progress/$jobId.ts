import { createFileRoute } from '@tanstack/react-router'
import { subscribe } from '~/lib/job-store'
import type { JobStatus } from 'tl-dw'

export const Route = createFileRoute('/api/progress/$jobId')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const encoder = new TextEncoder()
        let unsubscribe: (() => void) | undefined
        const stream = new ReadableStream({
          start(controller) {
            unsubscribe = subscribe(params.jobId, (status: JobStatus) => {
              try {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(status)}\n\n`))
                if (status.stage === 'complete' || status.stage === 'error') {
                  setTimeout(() => {
                    unsubscribe?.()
                    try {
                      controller.close()
                    } catch {}
                  }, 100)
                }
              } catch {}
            })
          },
          cancel() {
            unsubscribe?.()
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
