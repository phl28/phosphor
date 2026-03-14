import { createFileRoute } from '@tanstack/react-router'
import { getJob } from '~/lib/job-store'

export const Route = createFileRoute('/api/summary/$jobId')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const job = getJob(params.jobId)
        if (!job || job.status.stage !== 'complete') {
          return Response.json({ error: 'Not found or not complete' }, { status: 404 })
        }
        return Response.json(job.status.stage === 'complete' ? job.status.summary : null)
      },
    },
  },
})
