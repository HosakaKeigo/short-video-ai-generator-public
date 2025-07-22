#!/bin/bash

# Script to set up CORS configuration for Google Cloud Storage bucket
# Usage: ./setup-gcs-cors.sh

BUCKET_NAME="tmp_bucket_for_llm"
CORS_CONFIG_FILE="gcs-cors.json"

echo "Setting CORS configuration for bucket: $BUCKET_NAME"
echo "Using CORS config from: $CORS_CONFIG_FILE"

# Apply CORS configuration to the bucket
gsutil cors set $CORS_CONFIG_FILE gs://$BUCKET_NAME

# Verify the CORS configuration
echo ""
echo "Current CORS configuration:"
gsutil cors get gs://$BUCKET_NAME

echo ""
echo "CORS configuration has been applied successfully!"
echo ""
echo "Note: If you're still getting CORS errors, make sure to:"
echo "1. Add your production domain to the 'origin' array in gcs-cors.json"
echo "2. Re-run this script after making changes"