# phosphor-video

YouTube video summarization pipeline: Gemini video analysis (key moments + TL;DR), caption fetching, yt-dlp download, and ffmpeg frame extraction at key timestamps.

## Usage

```ts
import { summarizeVideo } from 'phosphor-video'

const summary = await summarizeVideo('https://www.youtube.com/watch?v=...', {
  jobId: 'some-unique-id',
  outputDir: '/data/output/some-unique-id',
  videoDir: '/data/videos',
  onProgress: (status) => console.log(status.stage, status.message),
})
```

`summary.keyMoments[].screenshotPath` and `summary.markdownPath` are relative to `outputDir` (e.g. `screenshots/frame-001.jpg`, `summary.md`) — map them to your own URL space when serving.

## Requirements

- `GEMINI_API_KEY` in the environment. The default model is `gemini-3.5-flash`; any Gemini model with video input works via the `model` option.
- `yt-dlp` and `ffmpeg` on PATH for screenshots. Without them the pipeline still returns a summary, just without images.
- Public YouTube videos only (Gemini's YouTube URL ingestion); the free tier caps YouTube processing at 8 hours of video per day.
