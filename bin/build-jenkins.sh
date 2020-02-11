#!/bin/bash

usage() {
    cat <<EOF
========================================================================================
Build Jenkins in empr-mds-tools namespace
----------------------------------------------------------------------------------------
Need to have an open PR to target with the Jenkins templates available at:
     "/openshift/templates/tools/jenkins"

Usage:
  ${0} [-h]
  OPTIONS:
  ========
    -h prints the usage for the script

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

# ===================================================================================================

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

oc process -f ${DIR}/../openshift/templates/tools/jenkins/_jenkins.bc.json \
    -p NAME=jenkins \
    -p NAME_SUFFIX="" \
    -p VERSION=v1 | oc apply -f - -n empr-mds-tools
