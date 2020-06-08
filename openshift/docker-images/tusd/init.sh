#!/bin/sh

tusd -base-path="/files/" -behind-proxy -s3-endpoint=${S3_ENDPOINT} -s3-bucket=${S3_BUCKET_ID} -s3-object-prefix=${S3_PREFIX}
