Implement backend/app/services/upload.py with actual upload logic.

Here's the sample example;

```python
import datetime as dt

from google import auth
from google.cloud import storage

credentials, project = auth.default()
credentials.refresh(auth.transport.requests.Request())

expiration_timedelta = dt.timedelta(days=1)

storage_client = storage.Client(credentials=credentials)
bucket = storage_client.get_bucket("bucket_name")
blob = bucket.get_blob("blob_name")

signed_url = blob.generate_signed_url(
    expiration=expiration_timedelta,
    service_account_email=credentials.service_account_email,
    access_token=credentials.token,
)
```

As noted you cannot use this if you are using Application Default Credentials from Google Compute Engine or from the Google Cloud SDK. 
To do that you need to add `Service Account Token Creator` role to the service account that is running your application.

