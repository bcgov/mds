#!/bin/bash
#========================================================================#
# MDS Dev Environment Validation
# Synopsis: seeds local dev db container with data from dump file
# Arguments:
DUMPFILE=${1}
#========================================================================#

CONTAINER=$(docker-compose ps --services --status running | grep postgres)
echo "Targeting postgres container: $CONTAINER"
if [ "$CONTAINER" = "" ];
then
    echo "Postgres container not found!"
    exit 1
fi

SERV_LIST=$(docker-compose ps --services --status running)
DOWN_LIST=$(echo $SERV_LIST | sed "s/$CONTAINER//g")

echo "Stopping other containers to close connections..."
docker-compose stop $DOWN_LIST

docker-compose cp $DUMPFILE $CONTAINER:/tmp/
docker-compose exec $CONTAINER sh -c "dropdb --user=mds --if-exists mds" || true
docker-compose exec $CONTAINER sh -c "createdb --user=mds mds" || true
docker-compose exec $CONTAINER sh -c "psql -U mds -ac 'GRANT ALL ON DATABASE "mds" TO "mds";'"
docker-compose exec $CONTAINER sh -c "gunzip -c  /tmp/$DUMPFILE | psql -v -U mds -d mds" || true
docker-compose exec $CONTAINER sh -c "psql -U mds -ac 'REASSIGN OWNED BY postgres TO mds;';"

echo "Restarting other containers..."
docker-compose up -d $SERV_LIST

echo "Database seeded"