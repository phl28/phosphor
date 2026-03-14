import { useState } from 'react'

const YT_REGEX = /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)[\w-]+/

export function UrlInput({
  onSubmit,
  disabled,
}: {
  onSubmit: (url: string) => void
  disabled: boolean
}) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = url.trim()
    if (!YT_REGEX.test(trimmed)) {
      setError('Please enter a valid YouTube URL')
      return
    }
    setError('')
    onSubmit(trimmed)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex gap-3">
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            if (error) setError('')
          }}
          placeholder="https://www.youtube.com/watch?v=..."
          disabled={disabled}
          className="flex-1 rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition"
        />
        <button
          type="submit"
          disabled={disabled}
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:hover:bg-blue-600 transition cursor-pointer"
        >
          {disabled ? 'Processing...' : 'Summarize'}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
    </form>
  )
}
