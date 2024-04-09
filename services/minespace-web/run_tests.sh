#!/bin/bash
set -exv -o pipefail

yarn run ci-test

sonar-scanner
