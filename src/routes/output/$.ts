import { createFileRoute } from '@tanstack/react-router'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.md': 'text/markdown; charset=utf-8',
}

export const Route = createFileRoute('/output/$')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const root = path.resolve('output')
        const filePath = path.resolve(root, params._splat ?? '')
        if (!filePath.startsWith(root + path.sep)) {
          return new Response('Not found', { status: 404 })
        }
        try {
          const data = await readFile(filePath)
          const type = CONTENT_TYPES[path.extname(filePath)] ?? 'application/octet-stream'
          return new Response(new Uint8Array(data), {
            headers: { 'Content-Type': type, 'Cache-Control': 'private, max-age=3600' },
          })
        } catch {
          return new Response('Not found', { status: 404 })
        }
      },
    },
  },
})
