aws sts assume-role --role-arn $ROLE_TO_ASSUME --role-session-name s3-cronjob

JSON=$(aws sts assume-role --role-arn $ROLE_TO_ASSUME --role-session-name s3-cronjob)

STS_KEY_ID=$(echo $JSON | jq -r '.Credentials.AccessKeyId' -)
STS_KEY_ACCESS=$(echo $JSON | jq -r '.Credentials.SecretAccessKey' -)
STS_TOKEN=$(echo $JSON | jq -r '.Credentials.SessionToken' -)

export AWS_ACCESS_KEY_ID=$STS_KEY_ID
export AWS_SECRET_ACCESS_KEY=$STS_KEY_ACCESS
export AWS_SESSION_TOKEN=$STS_TOKEN

aws sts get-caller-identity

aws s3 cp test_file.txt s3://mds-backups-dev/backups/test_file.txt