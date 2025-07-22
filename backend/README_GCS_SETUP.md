# Google Cloud Storage Setup for Video Upload

## Problem: "Network error during upload"

This error occurs when the browser tries to upload directly to GCS but encounters CORS restrictions.

## Solution Steps:

### 1. Set up CORS configuration for your GCS bucket

Run the provided script:
```bash
cd backend
./setup-gcs-cors.sh
```

Or manually apply CORS:
```bash
gsutil cors set gcs-cors.json gs://tmp_bucket_for_llm
```

### 2. Verify CORS configuration
```bash
gsutil cors get gs://tmp_bucket_for_llm
```

### 3. Check Authentication

Make sure you have proper authentication set up:

**Option A: Service Account Key**
```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

**Option B: Application Default Credentials**
```bash
gcloud auth application-default login
```

### 4. Required IAM Permissions

The service account needs these roles:
- `Storage Object Creator` - To create objects
- `Storage Object Viewer` - To read objects  
- `Service Account Token Creator` - To generate signed URLs (if using ADC)

### 5. Test with Mock Storage First

If you're still having issues, test with mock storage:
```bash
USE_MOCK_STORAGE=true python main.py
```

### 6. Debug Tips

1. Check browser console for detailed error messages
2. Look at Network tab to see the actual request/response
3. Check backend logs for signed URL generation details
4. Verify the Content-Type header matches your file type

### Common Issues:

1. **CORS not configured**: Run the setup script
2. **Wrong Content-Type**: The backend now maps file extensions to correct MIME types
3. **Authentication issues**: Make sure credentials are properly set
4. **Bucket permissions**: Verify IAM roles are correct

### Production Considerations:

1. Add your production domain to `gcs-cors.json`
2. Use more restrictive CORS settings
3. Set appropriate expiration times for signed URLs
4. Monitor usage and costs