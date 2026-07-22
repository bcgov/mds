#!/bin/sh

chmod +x ./hooks/post-finish
tusd -port 1080 -s3-endpoint=${S3_ENDPOINT} -s3-bucket=${S3_BUCKET_ID} -s3-object-prefix=${S3_PREFIX} --hooks-enabled-events post-finish --hooks-dir ./hooks