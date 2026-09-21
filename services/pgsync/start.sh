#!/bin/bash
set -e

echo "Waiting for Postgres..."
# We rely on docker-compose healthcheck, but a small sleep can help race conditions
sleep 5

echo "Running bootstrap..."
# We try to bootstrap. If it fails (e.g. already exists), we continue.
# We capture the output to check for specific errors if needed, but for now || true is a simple way to proceed.
bootstrap --config /config/schema.json || echo "Bootstrap command returned non-zero, possibly already initialized."

echo "Starting pgsync daemon..."
exec pgsync --config /config/schema.json --daemon
