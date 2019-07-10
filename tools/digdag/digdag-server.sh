#!/bin/bash

# Template any required environment variables for the property file
envsubst < digdag.properties.tmpl > digdag.properties

digdag server --database digdag-server --task-log digdag-logs --config digdag.properties
