#!/bin/bash
#========================================================================#
# MDS Dev Environment Validation
# Synopsis: Script used to check environment dependencies for development on MDS to help devs setup
# ARGUMENTS:
OS=${1}
#========================================================================#
# Global config
# These values are checked for in validation
LIC_PLATE="4c2ba9"
DESIRED_NODE_VER="v14.8.0"
DESIRED_YARN_VER="3.2.4"
DESIRED_DC_VER="v2"
SERVICES_PATH="./services"
# Start as valid
VALID=1

# Color codes
CGREEN="\e[0;92m"
CRED="\e[0;91m"
CRESET="\e[0m"

# Check idir
# TODO: Write validation
echo "Verify your idir has correct permissions via your PO"

# Check Git
GIT_RESPONSE=$(ssh -T git@github.com 2>&1)
if [[ $GIT_RESPONSE == *"successfully authenticated"* ]]; then
    echo -e "${CGREEN}PASSED GIT VALIDATION${CRESET}"
else
    VALID=0
    echo -e "${CRED}FAILED GIT VALIDATION${CRESET}"
    echo -e "${CRED}Have you setup your git config username/email?${CRESET}"
    echo -e "${CRED}Have you provisioned an ssh key and uploaded the public key (or GPG) to your github account?${CRESET}"
fi

# Check OS
if [ "$OS" = "windows" ]; then
    echo -e "${CRED}WARNING OS VALIDATION${CRESET}"
    echo "Please use a *unix environment as not all paths are compatible"
    echo "If you're on windows, consider WSL2.0 https://github.com/jon-funk/wsl-install-guide"
    echo "A linux dev container is on the way..."
else
    echo -e "${CGREEN}PASSED OS VALIDATION${CRESET}"
fi

# Check docker-compose version
DC_VER=$(docker-compose version)
if [[ "$DC_VER" == *"$DESIRED_DC_VER"* ]]; then
    echo -e "${CGREEN}PASSED DOCKER COMPOSE V2 VALIDATION${CRESET}"
else
    VALID=0
    echo -e "${CRED}FAILED DOCKER COMPOSE V2 VALIDATION${CRESET}"
    echo -e "${CRED}Have you installed docker-compose V2?${CRESET}"
fi

# Check docker & docker-compose
DOCKERBIN=$(which docker)
DOCKERCBIN=$(which docker-compose)
if [[ "$DOCKERBIN" == *bin\/docker ]] && [[ "$DOCKERCBIN" == *bin\/docker-compose ]]; then
    echo -e "${CGREEN}PASSED DOCKER VALIDATION${CRESET}"
else
    VALID=0
    echo -e "${CRED}FAILED DOCKER VALIDATION${CRESET}"
    echo -e "${CRED}Have you installed both docker and docker-compose?${CRESET}"
fi

# Check NPM Version for non-container compliance
NODE_VER=$(node --version)
if [[ "$NODE_VER" == *"$DESIRED_NODE_VER"* ]]; then
    echo -e "${CGREEN}PASSED NODE VALIDATION${CRESET}"
else
    VALID=0
    echo -e "${CRED}FAILED NODE VALIDATION${CRESET}"
    echo -e "${CRED}You should be on node version ${DESIRED_NODE_VER}?${CRESET}"
    echo -e "${CRED}You can install n to switch between node versions via 'sudo npm install -g n'${CRESET}"
    echo -e "${CRED}run: sudo n ${DESIRED_NODE_VER}${CRESET}"
fi

YARN_VER=$(yarn -v)
if [[ "$YARN_VER" == *"$DESIRED_YARN_VER"* ]]; then
    echo -e "${CGREEN}PASSED YARN VALIDATION${CRESET}"
else
    VALID=0
    echo -e "${CRED}FAILED YARN VALIDATION${CRESET}"
    echo -e "${CRED}You should be on YARN version ${DESIRED_YARN_VER}"
    echo -e "Follow : https://yarnpkg.com/getting-started/install to install Yarn V3"
fi

# Check OC
OC_CLI=$(which oc)
OC_ACCESS=$(oc get project | grep 4c2ba9)
if [ "$OC_CLI" = "" ]; then
    VALID=0
    echo -e "${CRED}FAILED OC INSTALL VALIDATION${CRESET}"
    echo -e "${CRED}Have you downloaded and installed the OC cli binary from https://github.com/openshift/okd/releases ?${CRESET}"
else
    echo -e "${CGREEN}PASSED OC INSTALL VALIDATION${CRESET}"
fi

if [ "$OC_ACCESS" = "" ]; then
    VALID=0
    echo -e "${CRED}FAILED OC ACCESS VALIDATION${CRESET}"
    echo -e "${CRED}Have you requested access to the MDS project set with license plate 4c2ba9 from your local DevOps?${CRESET}"
    echo -e "${CRED}If you're totally new to BCGov then you'll need to request access to the org via https://just-ask-web-bdec76-prod.apps.silver.devops.gov.bc.ca/${CRESET}"
    echo -e "${CRED}Are you logged into Openshift? Visit https://oauth-openshift.apps.silver.devops.gov.bc.ca/oauth/token/request and execute the oc command${CRESET}"
else
    echo -e "${CGREEN}PASSED OC ACCESS VALIDATION${CRESET}"
fi

# Check env files
if [ -f "$SERVICES_PATH/core-api/.env" ] &&
    [ -f "$SERVICES_PATH/core-web/.env" ] &&
    [ -f "$SERVICES_PATH/document-manager/backend/.env" ] &&
    [ -f "$SERVICES_PATH/filesystem-provider/.env" ] &&
    [ -f "$SERVICES_PATH/minespace-web/.env" ] &&
    [ -f "$SERVICES_PATH/nris-api/backend/.env" ] &&
    [ -f "$SERVICES_PATH/tusd/.env" ]; then
    echo -e "${CGREEN}PASSED ENV CONFIG VALIDATION${CRESET}"
else
    VALID=0
    echo -e "${CRED}FAILED ENV CONFIG VALIDATION${CRESET}"
    echo -e "${CRED}You have two options for setting up your .env files:${CRESET}"
    echo -e "${CRED}1: Generate boilerplate .env's that may need further tweaking via: make env${CRESET}"
    echo -e "${CRED}2: Request the current collection from a team member${CRESET}"
fi

if [ $VALID = 1 ]; then
    echo -e "${CGREEN}Successfully validated your environment!${CRESET}"
else
    echo -e "${CRED}Encountered a failure during validation!${CRESET}"
fi

exit 0
