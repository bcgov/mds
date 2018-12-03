#!/bin/bash
set -exv -o pipefail

npm run ci-test

/opt/app-root/sonar-scanner-cli/bin/sonar-scanner
