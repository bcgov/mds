#!/bin/bash

# Template any required environment variables for the property file
envsubst < digdag.properties.tmpl > digdag.properties
envsubst < gatekeeper.conf.tmpl > gatekeeper.conf


digdag server --database digdag-server --task-log digdag-logs --config digdag.properties &

# Wait for server to start and create projects
./wait-for-it.sh 0.0.0.0:8081 -- echo "Digdag Server running"


digdag push best-project --project project -r "$(date +%Y-%m-%dT%H:%M:%S%z)" --endpoint 0.0.0.0:8081

keycloak-gatekeeper --config ./gatekeeper.conf
# Add blocking call to ensure container doesn't exit
wait