#!/bin/bash

python -m pytest --cov=app --cov-report xml tests/

/opt/app-root/sonar-scanner-cli/bin/sonar-scanner "-Dsonar.host.url=${SONAR_HOST_URL}"
