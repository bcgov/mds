#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}--- MDS NoW Application Replicator ---${NC}"
echo "This script replicates a generic NoW Application from Production to your local environment OR a dev/test OpenShift environment."
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

# --- Helper Function: Find Primary Crunchy DB Pod ---
find_primary_db_pod() {
    local namespace=$1
    local selector="-n $namespace"
    if [ -z "$namespace" ]; then
        selector=""
    fi

    # Try to find the Crunchy Data Primary/Master pod
    local candidates=$(oc get pods $selector -l postgres-operator.crunchydata.com/role=master -o custom-columns=":metadata.name" --no-headers 2>/dev/null | grep -v "clone" || true)
    local master_pod=$(echo "$candidates" | grep "ha-" | head -n 1 || true)
    master_pod=${master_pod:-$(echo "$candidates" | head -n 1)}

    if [ -z "$master_pod" ]; then
        # Fallback: legacy search
        master_pod=$(oc get pods $selector -L postgres-operator.crunchydata.com/role --no-headers 2>/dev/null | grep "master" | grep -v "clone" | head -n 1 | awk '{print $1}')
    fi
    echo "$master_pod"
}

# --- Helper Function: Find Backend Pod ---
find_backend_pod() {
    local namespace=$1
    # User specified we should look for core-api-*** but not core-api-celery-***
    # We list pods, grep for core-api, exclude celery, and take the first one.
    local candidate=$(oc get pods -n "$namespace" -o name 2>/dev/null | grep "core-api" | grep -v "celery" | head -n 1 | cut -d/ -f2)
    
    # Fallback to generic backend if core-api not found (just in case)
    if [ -z "$candidate" ]; then
        candidate=$(oc get pods -n "$namespace" -l app.kubernetes.io/name=backend -o custom-columns=":metadata.name" --no-headers 2>/dev/null | head -n 1)
    fi
    
    echo "$candidate"
}


# 1. Prompt for NoW Number
read -p "Enter NoW Number to be copied from Prod (e.g. 0400022-2025-01): " NOW_NUMBER
if [ -z "$NOW_NUMBER" ]; then
    echo -e "${RED}Error: NoW Number is required.${NC}"
    exit 1
fi

# 2. Prompt for Target Environment
echo ""
echo "Select Target Environment:"
echo "1) Local (default)"

# Fetch available OpenShift Namespaces in 4c2ba9, EXCLUDING prod
# Assuming the user has access to list projects. If not, we might need a manual entry or just fail gracefully.
PROJECTS=$(oc get projects --no-headers 2>/dev/null | awk '{print $1}' | grep "^4c2ba9-" | grep -vE "prod$|tools$" || true)

i=2
declare -A PROJECT_MAP
if [ -n "$PROJECTS" ]; then
    for proj in $PROJECTS; do
        echo "$i) $proj"
        PROJECT_MAP[$i]=$proj
        i=$((i+1))
    done
fi

read -p "Select Target [1]: " TARGET_SELECTION
TARGET_SELECTION=${TARGET_SELECTION:-1}

TARGET_ENV="local"
TARGET_NAMESPACE=""

if [ "$TARGET_SELECTION" -ne 1 ]; then
    TARGET_NAMESPACE=${PROJECT_MAP[$TARGET_SELECTION]}
    if [ -z "$TARGET_NAMESPACE" ]; then
        echo -e "${RED}Error: Invalid selection.${NC}"
        exit 1
    fi
    TARGET_ENV="openshift"
    echo -e "Targeting OpenShift Namespace: ${GREEN}${TARGET_NAMESPACE}${NC}"
else
    echo -e "Targeting: ${GREEN}Local Docker Environment${NC}"
fi

# 3. Prompt for Mine GUID
echo ""
echo "Enter the GUID of the Mine in the TARGET environment you want to attach this NoW to."
read -p "Mine GUID: " MINE_GUID
if [ -z "$MINE_GUID" ]; then
    echo -e "${RED}Error: Mine GUID is required.${NC}"
    exit 1
fi

# 4. Prompt for SOURCE Prod Pod
echo ""
echo "Select the SOURCE Production Database Pod (must be in current oc context namespace)."
echo "Make sure you are logged into the PROD namespace (e.g., 4c2ba9-prod)!"

# Auto-detect SOURCE pod
# We assume the user is currently `oc project`ed into the source namespace (PROD), or we could force it.
# For now, let's assume current context is correct source as per original script logic.
MASTER_POD=$(find_primary_db_pod "")
PROD_POD=${MASTER_POD:-postgresql-prod-0}

echo "Detected Primary Pod Candidate: ${MASTER_POD:-(none)}"
echo ""
echo "Available Postgres Pods in Current Context:"
oc get pods -L postgres-operator.crunchydata.com/role --no-headers 2>/dev/null | grep -E "postgres|crunchy" | grep "ha-" || echo "  (none found)"
echo "" 

read -p "Source DB Pod Name [$PROD_POD]: " USER_POD
PROD_POD=${USER_POD:-$PROD_POD}
if [ -z "$PROD_POD" ]; then
    echo -e "${RED}Error: Source DB Pod not found or specified.${NC}"
    exit 1
fi


echo ""
echo -e "${YELLOW}Step 1: Generating SQL query from LOCAL COMPATIBLE backend...${NC}"
# We always generate the query using the LOCAL backend code to ensure compatibility with the logic we are running.
# NOTE: If we are targeting a remote env, we are sending data compatible with the LOCAL codebase.
# Ideally, the remote env code matches.
QUERY=$(docker compose exec -T backend flask generate-now-query --now-number "$NOW_NUMBER" | grep "SELECT 'now_application_guid=")

if [ -z "$QUERY" ]; then
    echo -e "${RED}Error: Failed to generate SQL query.${NC}"
    exit 1
fi

echo "$QUERY" > generated_query.sql
echo "Debug: SQL query saved to generated_query.sql"

echo -e "${YELLOW}Step 2: Fetching data from Prod and ingesting into Target...${NC}"

if [ "$TARGET_ENV" == "local" ]; then
    # --- Execute for Local ---
    (echo "SET search_path TO public;"; cat generated_query.sql) | \
        oc exec -i "$PROD_POD" -c database -- psql -d mds -At | \
        docker compose exec -T backend flask create-test-data --scenario now-application --mine-guid "$MINE_GUID" --non-interactive
else
    # --- Execute for Remote OpenShift ---
    echo "Locating backend pod in ${TARGET_NAMESPACE}..."
    TARGET_POD_CANDIDATE=$(find_backend_pod "$TARGET_NAMESPACE")
    
    echo "Detected Backend Pod Candidate: ${TARGET_POD_CANDIDATE:-(none)}"
    echo ""
    echo "Available Pods in Target Namespace (${TARGET_NAMESPACE}):"
    echo "Available Pods in Target Namespace (${TARGET_NAMESPACE}):"
    # List all pods to help user verify
    oc get pods -n "$TARGET_NAMESPACE" --no-headers 2>/dev/null | grep "core-api" | grep -v "celery" || echo "  (none found or access denied)"
    echo ""
    
    read -p "Target Backend Pod Name [${TARGET_POD_CANDIDATE}]: " USER_TARGET_POD
    TARGET_POD=${USER_TARGET_POD:-$TARGET_POD_CANDIDATE}
    
    if [ -z "$TARGET_POD" ]; then
        echo -e "${RED}Error: Target Backend Pod not specified.${NC}"
        rm -f generated_query.sql
        exit 1
    fi
    echo "Using target backend pod: $TARGET_POD"
    
    echo "Ingesting data..."
    (echo "SET search_path TO public;"; cat generated_query.sql) | \
        oc exec -i "$PROD_POD" -c database -- psql -d mds -At | \
        oc exec -n "$TARGET_NAMESPACE" -i "$TARGET_POD" -- flask create-test-data --scenario now-application --mine-guid "$MINE_GUID" --non-interactive
fi

rm -f generated_query.sql

echo ""
echo -e "${GREEN}Done!${NC}"
echo -e "${GREEN}Done!${NC}"
