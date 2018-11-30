#!/bin/bash
set -exv -o pipefail

coverage erase
coverage run --branch --source=app -m pytest
coverage xml -i

/opt/app-root/sonar-scanner-cli/bin/sonar-scanner
