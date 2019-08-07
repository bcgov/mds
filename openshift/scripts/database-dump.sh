#!/bin/sh
#
# Dumps from the MDS database and stores locally.  Project namespace required.
#
# Based on mds process:
#	https://github.com/bcgov/mds/blob/release/1.43.0/openshift/scripts/oc-dump.sh
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
SAVE_TO=${2:-./${PROJECT}-$( date +%Y-%m-%d-%H%M )}


# APP and mode variables
#
APP_NAME=${APP_NAME:-mds}

# Show message if passed any params
#
if [ "${#}" -eq 0 ]||[ "${#}" -gt 2 ]
then
	echo
    echo "Dumps from a mds database to store locally"
    echo
	echo "Provide a project name."
	echo " './database-dump.sh <project_name> <optional:output_file>'"
	echo
	exit
fi


# Check login
#
if ! oc whoami
then
    echo
    echo "Please obtain an OpenShift API token.  A window will open shortly."
    sleep 5
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

# Make sure $SAVE_TO ends in .pgCustom
#
[ "$( echo ${SAVE_TO} | tail -c4 )" == ".pgCustom" ]|| SAVE_TO="${SAVE_TO}.pgCustom"


# Identify database and take a backup
#
POD_DB=$( oc get pods -n ${PROJECT} -o name | grep -Eo "mds-postgresql-(test|prod)-[[:digit:]]+-[[:alnum:]]+" )
SAVE_FILE=$( basename ${SAVE_TO} )
SAVE_PATH=$( dirname ${SAVE_TO} )
mkdir -p ${SAVE_PATH}
oc exec ${POD_DB} -n ${PROJECT} -- /bin/bash -c \
	'pg_dump -U ${POSTGRESQL_USER} -d ${POSTGRESQL_DATABASE} -Fc \
	--column-inserts --data-only -T mms.* -T public.etl* -T nris.* -T docman.* -T public.flyway* > /tmp/'${SAVE_FILE}
oc rsync ${POD_DB}:/tmp/${SAVE_FILE} ${SAVE_PATH} -n ${PROJECT} --progress=true --no-perms=true
oc exec ${POD_DB} -n ${PROJECT} -- /bin/bash -c 'rm /tmp/'${SAVE_FILE}

# Summarize
#
echo
echo "Size: $( du -h ${SAVE_TO} | awk '{ print $1 }' )"
echo "Name: ${SAVE_TO}"
echo