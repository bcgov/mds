#!/bin/bash

usage() {
    cat <<EOF
========================================================================================
Port-forward to a MDS Database Instance
----------------------------------------------------------------------------------------
Usage:
  ${0} [-h] -p <project_namespace>
  OPTIONS:
  ========
    -h prints the usage for the script
    -p <project_namespace> the namespace for the project.

EOF
exit 1
}

# ===================================================================================================
# Setup
# ---------------------------------------------------------------------------------------------------
while getopts p:h FLAG; do
  case $FLAG in
    p ) PROJECT_NAMESPACE=$OPTARG ;;
    h ) usage ;;
    \?) #unrecognized option - show help
      echo -e \\n"Invalid script option"\\n
      usage
      ;;
  esac
done


if [ -z "${PROJECT_NAMESPACE}" ]; then
  echo -e \\n"Missing parameters!"
  usage
fi

if ! oc whoami
then
    echo
    echo "Please obtain an OpenShift API token.  A window will open shortly."
    sleep 3
    open https://console.pathfinder.gov.bc.ca:8443/oauth/token/request
    exit
fi

# ===================================================================================================
# Functions
# ---------------------------------------------------------------------------------------------------


get_pod_suffix () {
    echo $PROJECT_NAMESPACE | grep -Po "prod|test"
}

# ===================================================================================================
# Initializations
# ---------------------------------------------------------------------------------------------------


suffix="$(get_pod_suffix)"
selector="mds-postgresql-$suffix-[0-9]+-[a-z0-9]+"

# ===================================================================================================


oc project $PROJECT_NAMESPACE

podname=oc get pods | grep -Po $selector

oc port-forward $podname 15432:5432