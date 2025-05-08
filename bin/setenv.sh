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
permits
"
# FE services use a different key for the syncfusion license key
FRONTEND_SERVICES="
core-web
minespace-web
"
SECRET_KEYS="
OBJECT_STORE_ACCESS_KEY
COMMON_SERVICES_CLIENT_ID
COMMON_SERVICES_CLIENT_SECRET
CSS_CLIENT_ID
CSS_CLIENT_SECRET
PERMITS_CLIENT_SECRET
AZURE_API_KEY
AZURE_SEARCH_API_KEY
ELASTICSEARCH_CA_CERT
SYNCFUSION_LICENSE_KEY
SYNCFUSION_FRONTEND_LICENSE_KEY
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
            echo -e "${bold}Do you want to download and install oc? (answering anything except 'yes' will bypass this step)${normal}"
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

    echo "Configuring Access to Fontawesome"
    # Read ARTIFACTORY_TOKEN from local-dev-secrets ocp secret
    ARTIFACTORY_TOKEN=$(kubectl get secret local-dev-secrets --namespace 4c2ba9-dev -o go-template='{{.data.ARTIFACTORY_TOKEN | base64decode}}')
    
    # Update yarn config with token
    yarn config set 'npmScopes["fortawesome"].npmAuthIdent' "$ARTIFACTORY_TOKEN" -H
    yarn config set 'npmScopes["fortawesome"].npmAlwaysAuth' true -H
    yarn config set 'npmScopes["fortawesome"].npmRegistryServer' "https://artifacts.developer.gov.bc.ca/artifactory/api/npm/m4c2-mds/" -H
    yarn config unset 'npmScopes["fortawesome"].npmAuthToken' -H # Remove previous token used for authentication

    echo "Configuring local development secrets"
    # Read secrets where those env keys are consistently named to match the local-dev-secrets key
    for S in $SERVICES
    do
        echo "Configuring secrets for $S service"
        for KEY in $SECRET_KEYS
        do
            SECRET=$(kubectl get secret local-dev-secrets --namespace 4c2ba9-dev -o go-template="{{index .data.${KEY} | base64decode}}")
            if [ "$SECRET" = "" ]; then
                echo -e "Secret $KEY not found in local-dev-secrets"
                continue
            fi
            # handle all special characters in the secret, including new lines
            ESCAPED_SECRET=$(printf '%s' "$SECRET" | perl -pe 's/([\/&])/\\$1/g; s/\n/\\n/g')
            if [ "$KEY" = "ELASTICSEARCH_CA_CERT" ]; then
                ESCAPED_SECRET="\"$ESCAPED_SECRET\""
            fi
            perl -i -pe "s|^$KEY=.*|$KEY=$ESCAPED_SECRET|g" "$SERVICES_PATH/$S/.env" || echo -e "Failed to set $KEY for $S service"
        done
    done

    # Read secrets where those env keys are not consistently named to match the local-dev-secrets key
    OBJECT_STORE_ACCESS_KEY=$(kubectl get secret local-dev-secrets --namespace 4c2ba9-dev -o go-template='{{.data.OBJECT_STORE_ACCESS_KEY | base64decode}}')
    SYNCFUSION_FRONTEND_LICENSE_KEY=$(kubectl get secret local-dev-secrets --namespace 4c2ba9-dev -o go-template='{{.data.SYNCFUSION_FRONTEND_LICENSE_KEY | base64decode}}')
    
    for S in $SERVICES
    do
        perl -i -pe "s|^AWS_SECRET_ACCESS_KEY=.*|AWS_SECRET_ACCESS_KEY=$OBJECT_STORE_ACCESS_KEY|g" "$SERVICES_PATH/$S/.env" || echo -e "Failed to set AWS_SECRET_ACCESS_KEY for $S service"
    done

    for S in $FRONTEND_SERVICES    
    do
        echo "Configuring Syncfusion license key for $S service"
        ESCAPED_SECRET=$(printf '%s\n' "$SYNCFUSION_FRONTEND_LICENSE_KEY" | perl -pe 's/([\/&])/\\$1/g; s/\n/\\n/g')
        perl -i -pe "s|^SYNCFUSION_LICENSE_KEY=.*|SYNCFUSION_LICENSE_KEY=$ESCAPED_SECRET|g" "$SERVICES_PATH/$S/.env" || echo -e "Failed to set SYNCFUSION_LICENSE_KEY for $S service"
    done

    echo "Successfully configured secrets!"
}

if [ -z "$INPUT" ];
    then
        echo "This command will overwrite all .env files with data from the example files and openshift secrets!"
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
