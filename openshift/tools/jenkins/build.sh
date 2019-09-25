#!/usr/bin/env bash
set -e
export OCP_PIPELINE_VERSION='0.0.6'
export OCP_PIPELINE_CLI_URL="https://raw.githubusercontent.com/BCDevOps/ocp-cd-pipeline/v${OCP_PIPELINE_VERSION}/src/main/resources/pipeline-cli"

# Replace PR parameter with the latest Pull Request number that's making any changes
# to the jenkins build/deploy.
curl -sSL "${OCP_PIPELINE_CLI_URL}" | bash -s build --config=config.groovy --pr=1017
