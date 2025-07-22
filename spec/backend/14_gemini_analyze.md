Analyze video in Cloud Storage using Gemini AI.

## lib
```
!pip install google-genai
```

## Video Analysis from Cloud Storage

```python
from google import genai
from google.genai.types import HttpOptions, Part

client = genai.Client(http_options=HttpOptions(api_version="v1"),vertexai=True, project='your-project-id', location='us-central1')
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=[
        Part.from_uri(
            file_uri="gs://cloud-samples-data/generative-ai/video/ad_copy_from_video.mp4",
            mime_type="video/mp4",
        ),
        "What is in the video?",
    ],
)
print(response.text)
# Example response:
# The video shows several people surfing in an ocean with a coastline in the background. The camera ...
```

## Goal
Goal is to complete `backend/app/services/analyze.py` with the actual analysis logic.
`file_id` for the file in the Cloud Storage is passed as an argument to the function.