## FFmpegによる動画処理

Add new endpoint to clip videos using FFmpeg.

### 1. add FFmpeg to the Cloud Run

### 2. Implement the endpoint
`/api/clip` endpoint to clip videos using FFmpeg.

#### Input

```
video_url: str // Cloud Storage URL of the video to clip
start: float
end: float
title: str
```

Your goal is to clip a video from `start` to `end` using FFmpeg and return the clipped video URL with the specified `title`.

You can use command like this.

```
        cmd = [
            "ffmpeg",
            "-y",                 # overwrite without prompting
            "-ss", start,
            "-to", end,
            "-i", str(input_path),
            "-c", "copy",         # stream copy (fast, no quality loss)
            str(outfile),
        ]
```

