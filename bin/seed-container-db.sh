#!/bin/bash
#========================================================================#
# MDS Dev Environment Validation
# Script used to check environment dependencies for development on MDS to help devs setup
# Arguments:
DUMPFILE=${1}
#========================================================================#

CONTAINER=$(docker-compose ps --services --status running | grep postgres)

docker-compose cp $DUMPFILE $CONTAINER:/tmp/
docker-compose exec $CONTAINER sh -c "dropdb --user=mds --if-exists mds" || true
docker-compose exec $CONTAINER sh -c "createdb --user=mds mds" || true
docker-compose exec $CONTAINER sh -c "psql -U mds -ac 'GRANT ALL ON DATABASE "mds" TO "mds";'"
docker-compose exec $CONTAINER sh -c "gunzip -c  /tmp/$DUMPFILE | psql -v -U mds -d mds" || true
docker-compose exec $CONTAINER sh -c "psql -U mds -ac 'REASSIGN OWNED BY postgres TO mds;';"