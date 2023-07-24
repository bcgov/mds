#!/bin/bash
set -e

TARGET_APP=${1?"Enter App Name !"}
ENV=${2?"Enter ENV Name !"}
GIT_SHA=${3?"Enter GIT SHA of commit!"}
DISCORD_DEPLOYMENT_WEBHOOK=${4?"Enter DISCORD_DEPLOYMENT_WEBHOOK!"}
export ARGOCD_SERVER=${5?"Enter ARGOCD_SERVER!"}
export ARGOCD_AUTH_TOKEN=${6?"Enter ARGOCD_AUTH_TOKEN!"}

REPO_LOCATION=$(git rev-parse --show-toplevel)

function get_revision() {
    kubectl get deploy/$TARGET_APP -n 4c2ba9-$ENV -o=json | jq '.metadata.annotations["deployment.kubernetes.io/revision"]' -r
}

CURRENT_STATUS=$(kubectl rollout status -w deploy/$TARGET_APP -n 4c2ba9-$ENV)
CURRENT_REVISION=$(get_revision)
TARGET_REVISION=$(($CURRENT_REVISION + 1))

echo -e "\n"
echo "Current Status of $TARGET_APP is $CURRENT_STATUS"
echo "Current Revision of $TARGET_APP is $CURRENT_REVISION"

echo -e "\n"
echo "Watching for new revision of $TARGET_APP to be rolled out"
echo "Waiting for $TARGET_APP to sync and be in healthy state"

argocd app sync $TARGET_APP
argocd app wait $TARGET_APP

echo "Target Revision is achieved $CURRENT_REVISION"

echo "Watching rollout of new revision! "
kubectl rollout status -w deploy/$TARGET_APP -n 4c2ba9-$ENV

ROLLOUT_STATUS=$?

$REPO_LOCATION/gitops/notify_discord.sh $TARGET_APP $ENV $GIT_SHA $DISCORD_DEPLOYMENT_WEBHOOK $ROLLOUT_STATUS

# Set exit code to make github actions fail
if [ $ROLLOUT_STATUS == 1 ]; then
    exit 1
fi
