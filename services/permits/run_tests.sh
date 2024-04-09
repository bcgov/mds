#!/bin/bash
set -exv -o pipefail

coverage erase
coverage run --branch --source=app -m pytest
coverage xml -i

sonar-scanner
