#!/bin/bash
set -e

TARGET_APP=${1?"Enter App Name !"}
SOURCE_ENV=${2?"Enter Source Env Name !"}
TARGET_ENV=${3?"Enter Target Env Name !"}
ACTOR_NAME=${4?"Enter Actor Name !"}
GITHUB_TOKEN=${5?"Enter Github Token !"}

MDS_GIT_HASH=$(git rev-parse --verify HEAD)
REPO_URL="https://github.com/bcgov/mds/commit"
REPO_LOCATION=$(git rev-parse --show-toplevel)
TIMESTAMP=$(date +"%y-%m-%d-%H-%M-%S")

git config --global user.name $ACTOR_NAME
git config --global user.email "dev@mds.gov.bc.ca"

function commit() {
    git add -A

    if ! git diff-index --quiet HEAD; then
        git commit -m "$@"
        git push origin main
    fi
}

if [ ! -d $REPO_LOCATION/gitops/tenant-gitops-4c2ba9 ]; then
    git clone https://v-y-a-s:$GITHUB_TOKEN@github.com/bcgov-c/tenant-gitops-4c2ba9 $REPO_LOCATION/gitops/tenant-gitops-4c2ba9
fi

# Replace the commit id with new commit id of latest push
# ^ is the delimiter here since repo url has many forward slashes!

cd $REPO_LOCATION/gitops/tenant-gitops-4c2ba9

if [ $TARGET_ENV == 'dev' ]; then
    echo "$TARGET_ENV Environment, updating git hash in deployment env vars"

    # Replace the commit sha in env vars in overlay patch
    sed -i "s^git-commit.*^git-commit-$MDS_GIT_HASH^" $TARGET_APP/overlays/$TARGET_ENV/*deployment.patch.yaml
    commit "[$TARGET_APP] Pushed to $TARGET_ENV by $ACTOR_NAME - $REPO_URL/$MDS_GIT_HASH"
else
    echo "$TARGET_ENV Environment, Trigger deployment by promoting image from $SOURCE_ENV env"
    # copy git has from dev into test / prod overlay patch!
    # promotion of images are based off the same git hash!
    MDS_GIT_HASH=$(cat $TARGET_APP/overlays/$SOURCE_ENV/*deployment.patch.yaml | grep git-commit -m1 | cut -f2 -d ":" | xargs | cut -d "-" -f 3)
    echo
    # Replace the commit sha in env vars in overlay patch
    sed -i "s^git-commit.*^git-commit-$MDS_GIT_HASH^" $TARGET_APP/overlays/$TARGET_ENV/*deployment.patch.yaml
    commit "[$TARGET_APP] Pushed from $SOURCE_ENV to $TARGET_ENV by $ACTOR_NAME - $REPO_URL/$MDS_GIT_HASH"

fi
