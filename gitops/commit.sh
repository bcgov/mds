#!/bin/bash
set -e

TARGET_APP=${1?"Enter App Name !"}
TARGET_ENV=${2?"Enter Target Env Name !"}
ACTOR_NAME=${3?"Enter Actor Name !"}
GITHUB_TOKEN=${4?"Enter Target Env Name !"}

REPO_URL="https://github.com/bcgov/mds/commit"
REPO_LOCATION=$(git rev-parse --show-toplevel)
GIT_HASH=$(git rev-parse --verify HEAD)

git config --global user.email "automation@mds.gov.bc.ca"
git config --global user.name "gh-promoter"

if [ ! -d $REPO_LOCATION/gitops/tenant-gitops-4c2ba9 ]; then
    git clone https://v-y-a-s:$GITHUB_TOKEN@github.com/bcgov-c/tenant-gitops-4c2ba9 $REPO_LOCATION/gitops/tenant-gitops-4c2ba9
fi

# Replace the commit id with new commit id of latest push
sed -i "s/git-commit.*/git-commit-$REPO_URL/$GIT_HASH" $REPO_LOCATION/gitops/tenant-gitops-4c2ba9/$TARGET_APP/overlays/$TARGET_ENV/deployment.patch.yaml

cd $REPO_LOCATION/gitops/tenant-gitops-4c2ba9
git add .
git commit -m "[$TARGET_APP] Pushed to $TARGET_ENV by $ACTOR_NAME - $REPO_URL/$GIT_HASH"
git push
