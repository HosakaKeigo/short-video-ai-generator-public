There is two GCS presigned URL generation in the backend code. One is for uploading files, and the other is for downloading files after processing. The download URL should be generated with a shorter expiration time, such as 1 day, to ensure security and manageability.

Please refactor the code by extracting the common logic for generating presigned URLs into a separate function.

- backend/app/services/extract.py
- backend/app/services/upload.py