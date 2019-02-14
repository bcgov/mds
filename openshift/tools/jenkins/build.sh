#!/usr/bin/env bash
set -e
export OCP_PIPELINE_CLI_VERSION='0.0.6'
export OCP_PIPELINE_CLI_URL="https://raw.githubusercontent.com/BCDevOps/ocp-cd-pipeline/v${OCP_PIPELINE_CLI_VERSION}/src/main/resources/pipeline-cli"

curl -sSL "${OCP_PIPELINE_CLI_URL}" | bash -s build --config=config.groovy --pr=0