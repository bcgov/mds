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
for pr in "$@"
do
    oc project empr-mds-dev

    oc delete secret,pvc,all -l change-id=$pr

    oc project empr-mds-tools

    oc delete all -l change-id=$pr
    tags=`oc get istag -o=jsonpath=$(printf "${template}" "${pr}")`
    oc delete istag ${tags}
    

done

