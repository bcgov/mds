#!/bin/bash

# Template any required environment variables for the property file
envsubst < digdag.properties.tmpl > digdag.properties

digdag server --database digdag-server --task-log digdag-logs --config digdag.properties &

digdag push best-project --project project -r "$(date +%Y-%m-%dT%H:%M:%S%z)" --endpoint 0.0.0.0:8080

# Add blocking call to ensure container doesn't exit
wait