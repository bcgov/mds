#!/bin/bash
set -e

TARGET_APP=${1?"Enter App Name !"}
ENV=${2?"Enter ENV Name !"}
GIT_SHA=${3?"Enter GIT SHA of commit!"}
RC_TOKEN=${4?"Enter RC Token!"}
SUCCESS=${5?"Success-0 or Fail-1?"}

if [ $SUCCESS == 0 ]; then
    MSG_COLOR="#F8D210"
    EMOJI=":white_check_mark:"
    MSG="SUCCESS"
    MENTION=""
else
    MSG_COLOR="#FA26A0"
    EMOJI=":x:"
    MSG="FAILED"
    # ideally this should be a @all or @here notification. But our rocket chat bot in the bc gov tenant does not support it right now.
    MENTION="@hitankar.ray @justin.macaulay @cameron.wilson @Vyas"
fi

curl -X POST -H 'Content-Type: application/json' --data \
    '{
    "alias": "GitOpsBot",
    "text": "'"$EMOJI Deployment Message for $TARGET_APP $ENV $MENTION"'",
    "attachments": [
        {
            "title": "'"Argo CD: $TARGET_APP"'",
            "title_link": "'"https://argocd-shared.apps.silver.devops.gov.bc.ca/applications/mds-$TARGET_APP-$ENV"'",
            "text": "'"Deployment $MSG - $TARGET_APP - $ENV"'",
            "color": "'"$MSG_COLOR"'"
        },
        {
            "title": "Github: Commit",
            "title_link": "'"https://github.com/bcgov/mds/commit/$GIT_SHA"'",
            "text": "'"Deployment $MSG - $TARGET_APP - $ENV"'",
            "color": "'"$MSG_COLOR"'"
        }
    ]
}' https://chat.developer.gov.bc.ca/hooks/$RC_TOKEN
