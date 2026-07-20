import path from 'node:path'
import { summarizeVideo } from 'tl-dw'
import { updateJob } from './job-store'

export async function runJob(jobId: string, videoUrl: string) {
  try {
    const summary = await summarizeVideo(videoUrl, {
      jobId,
      outputDir: path.resolve('output', jobId),
      videoDir: path.resolve('storage', 'videos'),
      onProgress: (status) => updateJob(jobId, status),
    })

    updateJob(jobId, {
      stage: 'complete',
      summary: {
        ...summary,
        keyMoments: summary.keyMoments.map((m) => ({
          ...m,
          screenshotPath: m.screenshotPath ? `/output/${jobId}/${m.screenshotPath}` : '',
        })),
        markdownPath: `/output/${jobId}/${summary.markdownPath}`,
      },
    })
  } catch (err) {
    updateJob(jobId, {
      stage: 'error',
      error: err instanceof Error ? err.message : 'Unknown error',
    })
  }
}
