# SSL Renewal through certbot automation

# Overview
Request an automated certification renewal from Entrust via an openshift cronjob. This process requires info pre and post run of the cronjob from BCGov.

# Step 0:
- Backups, backups, BACKUPS, BACKUPS
- Copy all vanity route yaml & PVC data from openshift to preserve CERTS

# Step 1:


# Step 2:
`export NAMESPACE=4c2ba9-tools`

`oc process -n $NAMESPACE -f "https://raw.githubusercontent.com/BCDevOps/certbot/master/openshift/certbot.bc.yaml" -o yaml > certbot.bc.yaml`

`oc -n 4c2ba9-tools apply -f certbot.bc.yaml`

# Step 3:
Get the directory ID from X and manually replace the code below
`export DIR_ID=xx-xxxx-xxxx`

Then run:
(For entrust)
`export CERTBOT_SERVER=https://www.entrust.net/acme/api/v1/directory/$DIR_ID`
`export EMAIL=mds@gov.bc.ca`
`export NAMESPACE=4c2ba9-test`

(For letsencrypt)
`export CERTBOT_SERVER=https://acme-staging-v02.api.letsencrypt.org/directory`
`export EMAIL=mds@gov.bc.ca`
`export NAMESPACE=4c2ba9-tools`

`oc process -n $NAMESPACE -f "https://raw.githubusercontent.com/BcGovNeal/certbot/master/openshift/certbot.dc.yaml" -p CERTBOT_SUSPEND_CRON=true -p DRYRUN=true  -p EMAIL=$EMAIL -p NAMESPACE=$NAMESPACE -p CERTBOT_SERVER=$CERTBOT_SERVER -p CERTBOT_STAGING=true -p APPLICATION_NAME=core -o yaml > certbot.dc.yaml`
