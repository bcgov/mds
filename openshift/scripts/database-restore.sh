#!/bin/sh
#
# Dumps from a mds database and stores locally.  Project namespace required.
#
# Based on GWELLS process:
#	https://github.com/bcgov/gwells/blob/release/1.43.0/openshift/scripts/oc-restore.sh
#
# NOTE: You need to be logged in with a token, via:
#       https://console.pathfinder.gov.bc.ca:8443/oauth/token/request


# Halt conditions, verbosity and field separator
#
set -euo pipefail
[ "${VERBOSE:-x}" != true ]|| set -x
IFS=$'\n\t'


# Parameters
#
PROJECT=${1:-}
RESTORE=${2:-}


# APP and mode variables
#
APP_NAME=${APP_NAME:-mds}
DB_NAME=${DB_NAME:-${APP_NAME}}

# Show message if passed any params
#
if [ "${#}" -ne 2 ]
then
	echo
    echo "Restores a mds database from a local file"
    echo
	echo "Provide a project name."
	echo " './oc-restore.sh <project_name> <input_file>'"
	echo
	exit
fi


# Verify ${RESTORE} file
#
if [ ! -f "${RESTORE}" ]
then
	echo
	echo "Please verify ${RESTORE} exists and is non-empty.  Exiting."
	echo
	exit
fi


# Check login
#
if ! oc whoami
then
    echo
    echo "Please obtain an OpenShift API token.  A window will open shortly."
    sleep 3
    open https://console.pathfinder.gov.bc.ca:8443/oauth/token/request
    exit
fi


# Check project availability
#
CHECK=$( oc projects | tr -d '*' | grep -v "Using project" | grep "${PROJECT}" | awk '{ print $1 }' || echo )
if [ "${PROJECT}" != "${CHECK}" ]
then
	echo
	echo "Unable to access project ${PROJECT}"
	echo
	exit
fi


# Identify database and restore the backup
#
RESTORE_PATH=$( dirname ${RESTORE} )
RESTORE_FILE=$( basename ${RESTORE} )
POD_DB=$( oc get pods -n ${PROJECT} -o name | grep -Eo "mds-postgresql-(test|prod)-[[:digit:]]+-[[:alnum:]]+" )
oc cp ${RESTORE} "${POD_DB}":/tmp/ -n ${PROJECT}
oc exec ${POD_DB} -n ${PROJECT} -- /bin/bash -c 'pg_restore -d '${DB_NAME}' -c /tmp/'${RESTORE_FILE}

# Summarize
#
echo
echo "DB:   ${DB_NAME}"
echo "Size: $( du -h ${RESTORE} | awk '{ print $1 }' )"
echo "Name: ${RESTORE}"
echo