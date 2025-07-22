# Setting up Google Cloud Credentials

## Local Development Setup

1. **Place your service account key file in the credentials directory:**
   ```
   backend/credentials/service_account_key.json
   ```

2. **The credentials directory is git-ignored for security**
   - Never commit service account keys to version control
   - Each developer should use their own credentials

3. **Environment variable is automatically set**
   - The `.env` file sets: `GOOGLE_APPLICATION_CREDENTIALS=./credentials/service_account_key.json`
   - This is loaded automatically when the backend starts

## Required IAM Permissions

Your service account needs these roles:
- `Storage Object Admin` - To read/write objects in the bucket
- `Service Account Token Creator` - To generate signed URLs

## Verify Setup

Run the backend and check the logs:
```bash
cd backend
python main.py
```

You should see:
- "Generated signed URL for file_id: ..." when uploading
- No authentication errors

## Troubleshooting

1. **"Could not automatically determine credentials"**
   - Make sure the service account key file exists at `credentials/service_account_key.json`
   - Check that the file is valid JSON

2. **"Permission denied" errors**
   - Verify your service account has the required IAM roles
   - Check that the bucket name is correct in `.env`

3. **400 errors when uploading**
   - Run `./setup-gcs-cors.sh` to configure CORS on the bucket
   - Verify the Content-Type matches between presigned URL and upload