#!/bin/sh

chmod +x ./hooks/post-finish

# aws-sdk-go-v2 requires the S3 endpoint to be a full URI including scheme.
# S3_ENDPOINT is shared with other services (docman, filesystem-provider, etc.)
# that expect a bare hostname and prepend the scheme themselves, so default to
# https:// here rather than changing what the shared value looks like.
case "${S3_ENDPOINT}" in
  http://*|https://*) S3_ENDPOINT_URL=${S3_ENDPOINT} ;;
  *) S3_ENDPOINT_URL="https://${S3_ENDPOINT}" ;;
esac

tusd -port 1080 -s3-endpoint=${S3_ENDPOINT_URL} -s3-bucket=${S3_BUCKET_ID} -s3-object-prefix=${S3_PREFIX} --hooks-enabled-events post-finish --hooks-dir ./hooks