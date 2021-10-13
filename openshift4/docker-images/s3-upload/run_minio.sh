mc -C "/app/.mc" config
mc -C "/app/.mc" alias list
mc -C "/app/.mc" alias remove play
mc -C "/app/.mc" alias set s3 $S3_HOST $S3_ACCESS_KEY $S3_SECRET
mc -C "/app/.mc" alias list
mc -C "/app/.mc" cp $SRC s3/$DEST