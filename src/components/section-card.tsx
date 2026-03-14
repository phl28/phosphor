import type { KeyMoment } from '~/lib/types'

export function SectionCard({
  moment,
  index,
}: {
  moment: KeyMoment
  index: number
}) {
  return (
    <div className="rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden">
      {moment.screenshotPath && (
        <img
          src={moment.screenshotPath}
          alt={`Screenshot at ${moment.timestamp}`}
          className="w-full aspect-video object-cover"
          loading="lazy"
        />
      )}
      <div className="p-4">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
            {moment.timestamp}
          </span>
          <h3 className="font-semibold text-zinc-100">
            {index + 1}. {moment.title}
          </h3>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          {moment.description}
        </p>
      </div>
    </div>
  )
}
