#!/bin/bash
set -exv -o pipefail

npm run test:coverage

/opt/app-root/sonar-scanner-cli/bin/sonar-scanner
