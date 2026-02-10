#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}--- MDS NoW Application Replicator ---${NC}"
echo "This script replicates a generic NoW Application from Production to your local environment."
echo "Prerequisites: 'oc' (logged into prod) and 'docker' must be installed."
echo ""

# Check dependencies
if ! command -v oc &> /dev/null; then
    echo -e "${RED}Error: 'oc' command not found. Please install OpenShift CLI.${NC}"
    exit 1
fi
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: 'docker' command not found. Please install Docker.${NC}"
    exit 1
fi

# 1. Prompt for NoW Number
read -p "Enter NoW Number (e.g. 0400022-2025-01): " NOW_NUMBER
if [ -z "$NOW_NUMBER" ]; then
    echo -e "${RED}Error: NoW Number is required.${NC}"
    exit 1
fi

# 2. Prompt for Mine GUID
echo ""
echo "Enter the GUID of the Local Mine you want to attach this NoW to."
read -p "Mine GUID: " MINE_GUID
if [ -z "$MINE_GUID" ]; then
    echo -e "${RED}Error: Mine GUID is required.${NC}"
    exit 1
fi

# 3. Prompt for Prod Pod (or auto-detect)
echo ""
echo "Select the Production Database Pod."
echo "Make sure you are logged into the correct OpenShift namespace!"

# Try to find the Crunchy Data Primary/Master pod first
# Common label for Crunchy Data PGO 4.x/5.x master/primary
MASTER_POD=$(oc get pods -l postgres-operator.crunchydata.com/role=master -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)

if [ -z "$MASTER_POD" ]; then
    # Fallback: Parse the list we are about to show to find one labeled 'master'
    # We look for a line containing 'master' and take the first word (pod name)
    # We ignore "clone" pods to avoid picking temp instances
    MASTER_POD=$(oc get pods -L postgres-operator.crunchydata.com/role --no-headers 2>/dev/null | grep "master" | grep -v "clone" | head -n 1 | awk '{print $1}')
fi

# Fallback default if still not found
PROD_POD=${MASTER_POD:-postgresql-prod-0}

echo "Detected Primary Pod Candidate: ${MASTER_POD:-(none)}"
echo ""
echo "Available Postgres Pods (Primary usually has '-ha-' or unique hash):"
# List pods with their roles if possible, filtering for -ha- to reduce noise
# We use -F to properly handle the ha- string
oc get pods -L postgres-operator.crunchydata.com/role --no-headers 2>/dev/null | grep -E "postgres|crunchy" | grep "ha-" || echo "  (none found)"
echo "" 

read -p "Prod DB Pod Name [$PROD_POD]: " USER_POD
PROD_POD=${USER_POD:-$PROD_POD}

echo ""
echo -e "${YELLOW}Step 1: Generating SQL query from local backend...${NC}"
# Use grep to extract only the SQL query, ignoring any startup logs
QUERY=$(docker compose exec -T backend flask generate-now-query --now-number "$NOW_NUMBER" | grep "SELECT 'now_application_guid=")

if [ -z "$QUERY" ]; then
    echo -e "${RED}Error: Failed to generate SQL query.${NC}"
    exit 1
fi

echo "$QUERY" > generated_query.sql
echo "Debug: SQL query saved to generated_query.sql"

echo -e "${YELLOW}Step 2: Fetching data from Prod ($PROD_POD) and ingesting...${NC}"

# Execute command:
# 1. prepend search path to query file
# 2. redirect file to oc exec (which pipes to psql stdin)
# 3. pipe output to local backend flask command
# NOTE: We use stdin for query to avoid shell escaping issues with regex
(echo "SET search_path TO public;"; cat generated_query.sql) | \
    oc exec -i "$PROD_POD" -c database -- psql -d mds -At | \
    docker compose exec -T backend flask create-test-data --scenario now-application --mine-guid "$MINE_GUID" --non-interactive

rm -f generated_query.sql

echo ""
echo -e "${GREEN}Done!${NC}"
