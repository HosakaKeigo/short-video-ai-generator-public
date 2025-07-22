PROJECT_ID=$(gcloud config get-value project)
GCS_BUCKET_NAME=tmp_bucket_for_llm
FUNCTION_NAME="short-video-ai-generator-backend"
 
gcloud run deploy ${FUNCTION_NAME} \
--source=. \
--project=${PROJECT_ID} \
--region=asia-northeast1 \
--memory=512Mi \
--set-env-vars GCS_BUCKET_NAME=${GCS_BUCKET_NAME},GCS_PROJECT_ID=${PROJECT_ID}