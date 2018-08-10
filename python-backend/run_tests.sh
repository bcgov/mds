#!/bin/bash

python -m pytest

/opt/app-root/sonar-scanner-cli/bin/sonar-scanner "-Dsonar.host.url=${SONAR_HOST_URL}"
