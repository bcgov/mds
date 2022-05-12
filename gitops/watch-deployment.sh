#!/bin/bash
set -e

TARGET_APP=${1?"Enter App Name !"}
ENV=${2?"Enter ENV Name !"}
GIT_SHA=${3?"Enter GIT SHA of commit!"}
RC_TOKEN=${4?"Enter RC Token!"}

function get_revision() {
    kubectl get deploy/busybox -n 4c2ba9-$ENV -o=json | jq '.metadata.annotations["deployment.kubernetes.io/revision"]' -r
}

CURRENT_STATUS=$(kubectl rollout status -w deploy/$TARGET_APP -n 4c2ba9-$ENV)
CURRENT_REVISION=$(get_revision)
TARGET_REVISION=$(($CURRENT_REVISION + 1))

echo -e "\n"
echo "Current Status of $TARGET_APP is $CURRENT_STATUS"
echo "Current Revision of $TARGET_APP is $CURRENT_REVISION"

echo -e "\n"
echo "Watching for new revision of $TARGET_APP to be rolled out"
echo "Polling to watch rollout to achieve the target revision of $TARGET_REVISION"

until [ $CURRENT_REVISION == $TARGET_REVISION ]; do
    sleep 2
    CURRENT_REVISION=$(get_revision)
    echo "Refreshing the get revision of $TARGET_APP, currently $CURRENT_REVISION, waiting for $TARGET_REVISION"
done

echo "Target Revision is achieved $CURRENT_REVISION"

echo "Watching rollout of new revision! "
kubectl rollout status -w deploy/$TARGET_APP -n 4c2ba9-$ENV

ROLLOUT_STATUS=$?

if [ $ROLLOUT_STATUS == 0 ]; then
    MSG_COLOR="#F8D210"
    EMOJI=":rocket:"
    MSG="SUCCESS"
    false
else
    MSG_COLOR="#FA26A0"
    EMOJI=":skull:"
    MSG="FAILED"
    # ideally this should be a @all or @here notification. But our rocket chat bot in the bc gov tenant does not support it right now.
    MENTION="@hitankar.ray @justin.macaulay"
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

# Set exit code to make github actions fail
if [ $ROLLOUT_STATUS == 1 ]; then
    exit 1
fi
