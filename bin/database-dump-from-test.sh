#!/bin/sh
#
# Dumps from the MDS database and stores locally.  Project namespace required.
#
# Based on mds process:
#	https://github.com/bcgov/mds/blob/release/1.43.0/openshift/scripts/oc-dump.sh
#
# NOTE: You need to be logged in with a token, via:
#       https://console.pathfinder.gov.bc.ca:8443/oauth/token/request

# Parameters
#
PROJECT=${1}
SAVE_TO=${2}

# Show message if passed any params
#
if [ "${#}" -eq 0 ]||[ "${#}" -gt 2 ]
then
	echo
    echo "Dumps from a mds database to store locally"
    echo
	echo "Provide a project name."
	echo " './database-dump-from-test.sh <project_name> <optional:output_file>'"
	echo
	exit
fi

# Ensure user only has psql container up
#
echo "Are you currently ONLY running the psql container?"
echo "(y/n):"
read INPUT
if [ "$INPUT" != "y" ]
then
	echo
	echo "Please bring down all of your containers EXCEPT mds_postgres"
	echo
	exit
fi

# Check login
#
if ! oc whoami
then
    echo
    echo "Please use the oc CLI client to login and obtain a session token then re-run this command"
	echo "https://console.pathfinder.gov.bc.ca:8443/console/project/empr-mds-dev/overview"
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

# # Identify database and take a backup
# #
POD_DB=$( oc get pods -n ${PROJECT} -o name | grep -Eo "mds-postgresql-test-[[:digit:]]+-[[:alnum:]]+" )
SAVE_FILE=$( basename ${SAVE_TO} )
SAVE_PATH=$( dirname ${SAVE_TO} )
mkdir -p ${SAVE_PATH}

# Use oc to rsync data and download locally
#
oc exec ${POD_DB} -n ${PROJECT} -- /bin/bash -c \
	'pg_dump -Fp --no-owner -U postgres mds \
	| gzip > /tmp/'${SAVE_FILE}
oc rsync ${POD_DB}:/tmp/${SAVE_FILE} ${SAVE_PATH} -n ${PROJECT} --progress=true --no-perms=true
oc exec ${POD_DB} -n ${PROJECT} -- /bin/bash -c 'rm /tmp/'${SAVE_FILE}

# Summarize
#
echo
echo "Size: $( du -h ${SAVE_TO} | awk '{ print $1 }' )"
echo "Name: ${SAVE_TO}"
echo

# Automate import into containerized db
#
echo "Perform automatic import to your local running psql container?"
echo "NOTE: Your local containerized psql db will be dropped!"
echo "(y/n):"
read INPUT
if [ "$INPUT" = "y" ]
then
	echo
	echo "Performing automatic import"
	docker cp $SAVE_PATH/$SAVE_FILE mds_postgres:docker-entrypoint-initdb.d/
	docker exec -it mds_postgres sh -c "dropdb --user=mds --if-exists mds" || true
	docker exec -it mds_postgres sh -c "createdb --user=mds mds" || true
	docker exec -it mds_postgres sh -c "psql -U mds -ac 'GRANT ALL ON DATABASE "mds" TO "mds";'"
	docker exec -it mds_postgres sh -c "gunzip -c  $SAVE_FILE | psql -v -U mds -d mds" || true
	docker exec -it mds_postgres sh -c "psql -U mds -ac 'REASSIGN OWNED BY postgres TO mds;';"
	echo
fi

echo
echo "Removing local dump file..."
echo
rm $SAVE_PATH/$SAVE_FILE || true