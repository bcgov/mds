#!/bin/bash
#========================================================================#
# MDS Container rebuild
# Synopsis: Script used to intelligently rebuild only what the dev is using
#========================================================================#
# TODO: allow passthrough to build specific container via do-nothing make target

SERV_LIST=$(docker-compose ps --services --status running)
SERV_LIST=$(echo "$SERV_LIST"|tr '\n' ' ') # trim newlines

echo "Rebuilding and running:"
echo $SERV_LIST
echo "Rebuilding..."
docker-compose build --force-rm --no-cache --parallel $SERV_LIST
echo "Restarting..."
docker-compose up --always-recreate-deps --force-recreate -d $SERV_LIST
echo "Rebuild complete!"