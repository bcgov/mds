#!/bin/sh

tusd -base-path="/files/" -behind-proxy -s3-endpoint=${S3_ENDPOINT} -s3-bucket=${S3_BUCKET_ID} -s3-object-prefix=${S3_PREFIX} --hooks-enabled-events post-finish --hooks-http ${DOCUMENT_MANAGER_URL}/tusd-hooks --hooks-http-retry 5 --hooks-http-backoff 2 -hooks-http-forward-headers=Authorization -verbose
