#!/bin/bash
set -e

TARGET_APP=${1?"Enter App Name !"}
ENV=${2?"Enter ENV Name !"}
GIT_SHA=${3?"Enter GIT SHA of commit!"}
DISCORD_URL=${4?"Enter DISCORD Webhook!"}
SUCCESS=${5?"Success-0 or Fail-1?"}

if [ $SUCCESS == 0 ]; then
    MSG_COLOR=65280
    EMOJI=":white_check_mark:"
    MSG="SUCCESS"
    MENTION="@here"
else
    MSG_COLOR=14177041
    EMOJI=":x:"
    MSG="FAILED"
    MENTION="@here"
fi

curl -X POST -H 'Content-Type: application/json' --data \
    '{
    "content": "'"$EMOJI Deployment Message for $TARGET_APP $ENV $MENTION"'",
    "embeds": [
        {
            "title": "'"Argo CD: $TARGET_APP"'",
            "description": "'"Deployment $MSG - $TARGET_APP - $ENV [click here](https://argocd-shared.apps.silver.devops.gov.bc.ca/applications/mds-$TARGET_APP-$ENV)"'",
            "color": "'"$MSG_COLOR"'"
        },
        {
            "title": "Github: Commit",
            "description": "'"Deployment $MSG - $TARGET_APP - $ENV [click here](https://github.com/bcgov/mds/commit/$GIT_SHA)"'",
            "color": "'"$MSG_COLOR"'"
        }
    ]
}' $DISCORD_URL
