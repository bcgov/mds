#!/bin/bash

# Export Openshift token for global access
if [ -f /var/run/secrets/kubernetes.io/serviceaccount/token ]; then
    export OC_TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token);
fi

# Template any required environment variables for the property files
envsubst < digdag.properties.tmpl > digdag.properties
envsubst < gatekeeper.conf.tmpl > gatekeeper.conf

# Run digdag server in the background
digdag server --database digdag-server --task-log digdag-logs --config digdag.properties &

# Wait for server to start properly
./wait-for-it.sh -t 120 0.0.0.0:8081 -- echo "Digdag Server running"
# Wait for migrations to run before pushing new project details
sleep 30
# Update the projects
# digdag push etl-tasks --project etl -r "$(date +%Y-%m-%dT%H:%M:%S%z)" --endpoint 0.0.0.0:8081
# Run keycloak-gatekeeper for authenticated reverse proxy
keycloak-gatekeeper --config ./gatekeeper.conf

# Bring any background processes to front to block container exit
wait