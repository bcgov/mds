#!/bin/bash
set -e

TARGET_APP=${1?"Enter App Name !"}
TARGET_ENV=${2?"Enter Target Env Name !"}
GITHUB_TOKEN=${3?"Enter Target Env Name !"}

REPO_LOCATION=$(git rev-parse --show-toplevel)
GIT_HASH=$(git rev-parse --verify HEAD)

git config --global user.email "automation@mds.gov.bc.ca"
git config --global user.name "gh-promoter"

if [ ! -d $REPO_LOCATION/gitops/tenant-gitops-4c2ba9 ]; then
    git clone https://v-y-a-s:$GITHUB_TOKEN@github.com/bcgov-c/tenant-gitops-4c2ba9 $REPO_LOCATION/gitops/tenant-gitops-4c2ba9
fi

# Replace the commit id with new commit id of latest push
sed -i "s/git-commit.*/git-commit-$GIT_HASH/" $REPO_LOCATION/gitops/tenant-gitops-4c2ba9/$TARGET_APP/overlays/$TARGET_ENV/deployment.patch.yaml

cd $REPO_LOCATION/gitops/tenant-gitops-4c2ba9
git add .
git commit -m "Update $TARGET_APP for $TARGET_ENV with $GIT_HASH"
git push
