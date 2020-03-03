#!/bin/bash

usage() {
    cat <<EOF
========================================================================================
Delete all objects associated with a PR in the Dev space
----------------------------------------------------------------------------------------
Usage:
  ${0} [-h] -c <change_id>
  OPTIONS:
  ========
    -h prints the usage for the script
    -c <change_id> the PR number for the image stream to remove.

EOF
exit 1
}

# ===================================================================================================
# Setup
# ---------------------------------------------------------------------------------------------------
while getopts c:h FLAG; do
  case $FLAG in
    c ) CHANGE_ID=$OPTARG ;;
    h ) usage ;;
    \?) #unrecognized option - show help
      echo -e \\n"Invalid script option"\\n
      usage
      ;;
  esac
done

if ! oc whoami
then
    echo
    echo "Please obtain an OpenShift API token.  A window will open shortly."
    sleep 3
    open https://console.pathfinder.gov.bc.ca:8443/oauth/token/request
    exit
fi

template='{.items[?(@.tag.name=="build-pr-%s")].metadata.name}'

# ===================================================================================================
oc project empr-mds-dev

oc delete secret,pvc,all -l change-id=$CHANGE_ID

oc project empr-mds-tools

oc delete is -l change-id=$CHANGE_ID
tags=`oc get istag -o=jsonpath=$(printf "${template}" "${CHANGE_ID}")`
oc delete istag ${tags}