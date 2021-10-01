mc config
mc alias list
mc alias remove play
mc alias set s3 $S3_HOST $S3_ACCESS_KEY $S3_SECRET
mc alias list
mc cp $SRC s3/$DEST