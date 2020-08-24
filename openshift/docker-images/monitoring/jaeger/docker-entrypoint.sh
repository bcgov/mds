#!/bin/bash

# Template any required environment variables for the property files
envsubst < gatekeeper.conf.tmpl > gatekeeper.conf

# Start Jaeger all in one in background
/go/bin/all-in-one-linux --sampling.strategies-file=/etc/jaeger/sampling_strategies.json &

# Wait for server to start properly
./wait-for-it.sh -t 120 0.0.0.0:16686 -- echo "Jaeger UI running"

# Run keycloak-gatekeeper for authenticated reverse proxy
keycloak-gatekeeper --config ./gatekeeper.conf

# Bring any background processes to front to block container exit
wait