# Phosphor

YouTube video summarizer that generates AI-powered visual summaries with key moments, screenshots, and transcripts.

## How it works

1. Paste a YouTube URL
2. Gemini AI analyzes the video to identify key moments and generate a TL;DR
3. Transcripts are fetched, video frames are extracted at key timestamps
4. A visual summary is presented with screenshots, descriptions, and the full transcript

Progress updates are streamed in real time via Server-Sent Events.

## Tech stack

- **Frontend**: React 19, TanStack Router, TanStack Query, Tailwind CSS v4
- **Backend**: TanStack Start (Vite, Node.js)
- **AI**: Google Gemini (gemini-2.5-flash)
- **Tools**: yt-dlp, ffmpeg

## Prerequisites

- Node.js 22+
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) and [ffmpeg](https://ffmpeg.org/) (provided via [Devbox](https://www.jetify.com/devbox))
- A [Google Gemini API key](https://aistudio.google.com/apikey)

## Setup

```bash
npm install

# If using Devbox for yt-dlp and ffmpeg:
devbox shell
```

Create a `.env` file:

```
GEMINI_API_KEY=your_key_here
```

## Development

```bash
npm run dev
```

Opens at `http://localhost:3000`.

## Production

```bash
npm run build
npm run start
```
