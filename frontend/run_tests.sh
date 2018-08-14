#!/bin/bash

npm run test:coverage

/opt/app-root/sonar-scanner-cli/bin/sonar-scanner "-Dsonar.host.url=${SONAR_HOST_URL}"
