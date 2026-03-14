import type { JobStatus, VideoSummary } from './types'

type Listener = (status: JobStatus) => void

interface Job {
  id: string
  status: JobStatus
  listeners: Set<Listener>
}

const jobs = new Map<string, Job>()

const JOB_TTL = 30 * 60 * 1000

export function createJob(id: string) {
  const job: Job = {
    id,
    status: { stage: 'analyzing', message: 'Starting...' },
    listeners: new Set(),
  }
  jobs.set(id, job)
  setTimeout(() => jobs.delete(id), JOB_TTL)
  return job
}

export function updateJob(id: string, status: JobStatus) {
  const job = jobs.get(id)
  if (!job) return
  job.status = status
  for (const listener of job.listeners) {
    listener(status)
  }
}

export function getJob(id: string) {
  return jobs.get(id) ?? null
}

export function subscribe(id: string, listener: Listener): () => void {
  const job = jobs.get(id)
  if (!job) {
    listener({ stage: 'error', error: 'Job not found' })
    return () => {}
  }

  listener(job.status)
  job.listeners.add(listener)
  return () => job.listeners.delete(listener)
}
