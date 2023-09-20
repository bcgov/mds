#!/bin/bash
#========================================================================#
# MDS Dev Environment boilerplate setup
# Synopsis: Script used to deploy collection of boilerplate .env files for development on MDS
#========================================================================#
# Global config
# These values are checked for in validation
SERVICES_PATH="./services"
SERVICES="
core-web
core-api
nris-api/backend
document-manager/backend
filesystem-provider
minespace-web
tusd
"

bold=$(tput bold)
normal=$(tput sgr0)

# Install openshift cli - use on linux systems only
function installOc() {
    wget https://github.com/okd-project/okd/releases/download/4.13.0-0.okd-2023-09-03-082426/openshift-client-linux-4.13.0-0.okd-2023-09-03-082426.tar.gz
    tar -xvf openshift-client-linux-4.13.0-0.okd-2023-09-03-082426.tar.gz
    sudo mv oc /usr/bin
}

# Retrieves FontAwesome secret from openshift and configures yarn to use it when installing fontawesome packages.
function loadExternalSecrets() {
    OC_CLI=$(which oc)
    OC_ACCESS=$(oc get project | grep 4c2ba9-dev)

    if [ "$OC_CLI" = "" ]; then
        VALID=0
        echo -e "Could not find oc binary."
        echo -e "Make sure you download the OpenShift cli binary (oc) from https://github.com/openshift/okd/releases ?"

        if [ "$CODESPACES" = "true" ]; then
            echo -e "${bold}Do you want to download and install oc? (only accepts 'yes')${normal}"
            read INSTALL_OC

            if [ "$INSTALL_OC" = "yes" ]; then
                installOc
            else
                exit 1
            fi
            else
                exit 1;
        fi
    fi

    if [ "$OC_ACCESS" = "" ]; then
        VALID=0
        echo -e "Could not connect to openshift project. Have you requested access to the MDS project set with license plate 4c2ba9 from your local DevOps?"
        echo -e "If you're totally new to BCGov then you'll need to request access to the org via https://just-ask-web-bdec76-prod.apps.silver.devops.gov.bc.ca/\n\n"
        echo -e "If you already have access, click here to generate a token and paste it into the terminal: ${bold}https://oauth-openshift.apps.silver.devops.gov.bc.ca/oauth/token/request${normal}\n\n"
        echo -e "${bold}...Paste Token Here...${normal}"
        read OC_TOKEN
        
        # Log in to openshift and verify that you have access
        oc login --token=$OC_TOKEN --server=https://api.silver.devops.gov.bc.ca:6443
        OC_ACCESS=$(oc get project | grep 4c2ba9-dev)
        if [ "$OC_ACCESS" = "" ]; then
            echo -e "You still don't have access to the 4c2ba9-dev namespace"
            exit 1
        fi
    fi

    # Read FONT_AWESOME_PACKAGE_TOKEN from local-dev-secrets ocp secret
    FONT_AWESOME_PACKAGE_TOKEN=$(kubectl get secret local-dev-secrets --namespace 4c2ba9-dev -o go-template='{{.data.FONT_AWESOME_PACKAGE_TOKEN | base64decode}}')
    
    # Update yarn config with token
    yarn config set 'npmScopes["fortawesome"].npmAuthToken' "$FONT_AWESOME_PACKAGE_TOKEN" -H
    yarn config set 'npmScopes["fortawesome"].npmAlwaysAuth' true -H
    yarn config set 'npmScopes["fortawesome"].npmRegistryServer' "https://npm.fontawesome.com/" -H
}

if [ -z "$INPUT" ];
    then
        echo "This command can be destructive if you have valid .env's in place and run this multiple times!"
        echo "${bold}Continue? (only accepts 'yes')${normal}"
        read INPUT
fi

if [ "$INPUT" = "yes" ];
then
    for S in $SERVICES
    do
        echo "$SERVICES_PATH/$S/.env"
        [ ! -f "$SERVICES_PATH/$S/.env" ] || cp $SERVICES_PATH/$S/.env $SERVICES_PATH/$S/.env-last-backup
        cp $SERVICES_PATH/$S/.env-example $SERVICES_PATH/$S/.env
    done
    echo ".env files setup!"
fi

if [ -z "$LOAD_EXTERNAL" ];
    then
        echo "${bold}Do you want to load secrets from OpenShift for development purposes? (only accepts 'yes')${normal}"
        read LOAD_EXTERNAL
fi

if [ "$LOAD_EXTERNAL" = "yes" ];
    then
        loadExternalSecrets
fi
