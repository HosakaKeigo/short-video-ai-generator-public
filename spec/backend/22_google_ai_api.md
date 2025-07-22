# Add Google Developer AI API support
Currently we implement video processing using Vertex AI with Cloud Storage in analyze.py.

Now I want to add support for Google Developer AI API, when `GOOGLE_API_KRY` is available.

Here's the example using Files API;

```python
    # https://ai.google.dev/gemini-api/docs/files
    file_ref = client.files.upload(file=str(video_path))

    while file_ref.state == "PROCESSING":
        print(file_ref.state)
        print(file_ref.name)
        print('Waiting for video to be processed.')
        time.sleep(5)
        file_ref = client.files.get(name=file_ref.name)

    print("upload completed")

    ...

    contents=[
        types.UserContent(parts=[file_ref, USER_PROMPT]),
    ],
```

Please keep vertexai implementation. 

Prioritize Google Developer AI API if `GOOGLE_API_KEY` is available.