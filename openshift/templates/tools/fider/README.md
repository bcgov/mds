# NRM Fider Deployment

## Files

* [Deployment configuration](./openshift/fider.dc.json) for Fider application
* [Deployment configuration](./openshift/postgresql.dc.json) for PostgreSQL Database, acting as the datastore for the Fider application

## Image (customized)

Since BC Gov's SMTP configuration does not support smtps, and Fider's SMTP Go library enforces smtps, we fork the code so that we remove the authn/authz from our deployment.

To create an image off this forked code:

```bash
oc -n b7cg3n-tools new-build --strategy=docker --to='fider-notls:latest' https://github.com/garywong-bc/nrm-fider#v0.18.0.notls
```

To tag this image to match `major.minor` version of Fider:

```bash
oc -n b7cg3n-tools tag fider:latest fider:0.18.0
```

### Image (Out-of-the-box)

If and when we solve the SMTPS issue, we should build directly off the Fider image, such as:

1. Import a specific tagged release:

```bash
oc -n b7cg3n-tools import-image fider:0.18.0 --from=getfider/fider:0.18.0 --confirm --insecure --reference-policy=local
```

2. Once imported with the correct release number, tag with to show the latest version:

```bash
oc -n b7cg3n-tools tag fider:latest fider:0.18.0 
```

NOTE: To remove tags, the syntax is:

```bash
oc -n b7cg3n-tools tag -d fider:latest
oc -n b7cg3n-tools tag -d fider:v0.18.0
```

NOTE: To update our Fider image, we would import the new version (e.g. `0.19.0`), tag *this* to be `latest`, and plan for a redeploy using the newer image.

## Deploy

### Database

Deploy the DB using the correct FEEDBACK_NAME parameter (e.g. `xyzfider`):

```bash
oc -n b7cg3n-deploy new-app --file=./openshift/postgresql.dc.json -p FEEDBACK_NAME=xyzfider
```

All DB deployments are based on the out-of-the-box [OpenShift Database Image](https://docs.openshift.com/container-platform/3.11/using_images/db_images/postgresql.html).

#### Reset Database

To re-deploy *just* the database, first idle the dateabase service and then delete the deployed objects from the last run, with the correct FEEDBACK_NAME, such as:

```bash
oc -n b7cg3n-deploy idle xyzfider-postgresql
oc -n b7cg3n-deploy delete secret/xyzfider-postgresql svc/xyzfider-postgresql pvc/xyzfider-postgresql
oc -n b7cg3n-deploy delete dc xyzfider-postgreql
```

NOTE: This destroys the persistent database too, so you will lose all your Fider data.  If you wish to only redeploy the DB runtime but not the data, then omit the `pvc/xyzfider-postgresql` object from the above command.

### Application

Deploy the Application using the feedback-specific parameter (e.g. `xyzfider`):

```bash
oc -n b7cg3n-deploy new-app --file=./openshift/fider.dc.json -p FEEDBACK_NAME=xyzfider
```

#### Reset Application

To redeploy *just* the application, first delete the deployed objects from the last run, with the correct FEEDBACK_NAME, such as:

```bash
oc -n b7cg3n-deploy delete dc/xyzfider-app svc/xyzfider route/xyzfider secret/xyzfider-jwt
```

## Perform initial Fider installation

Although Fider is setup to *auto-install* upon the initial deployment, the OpenShift DB template disallows the application account to install DB extensions.

Therefore, run the the following via `oc rsh`, with the correct FEEDBACK_NAME and credentials, such as:

```bash
oc -n b7cg3n-deploy rsh $(oc -n b7cg3n-deploy get pods | grep xyzfider-postgresql- | grep Running | awk '{print $1}')
psql ${POSTGRESQL_DATABASE}  -c "ALTER USER ${POSTGRESQL_USER} WITH SUPERUSER"
```

*NOTE*: Due to apps.smtp.gov.bc.ca running with a different hostname on its certificate, we have to use gmail with TLS for now.  Ensure that the app-specific password for environment variable EMAIL_SMTP_PASSWORD is set correctly.

### Log into the Fider installation

Once the application has finished the initial instal you may open the app in a browser, to set the admin user; the URL will be of the form `https://<xyz>.pathfinder.gov.bc.ca/`.

### Reset database account privileges

Please revoke the superuser privilege afterwards:

```bash
oc -n b7cg3n-deploy rsh $(oc -n b7cg3n-deploy get pods | grep xyz-postgresql- | grep Running | awk '{print $1}')
psql ${POSTGRESQL_DATABASE}  -c "ALTER USER ${POSTGRESQL_USER} WITH NOSUPERUSER"
```

## FAQ

1 To login into the database, open the DB pod terminal (via OpenShift Console or oc rsh) and enter:

```bash
psql -U ${POSTGRESQL_USER} ${POSTGRESQL_DATABASE}
```

2 To reset all deployed objects (this will destroy all data amd persistent volumes).  Only do this on a botched initial install or if you have the DB backed up and ready to restore into the new wiped database.  
`oc -n b7cg3n-deploy delete all,secret,pvc -l app=xyzfider`

3 For each specific Fider project, it may be useful to set an environment variable for the deployment, for example the `xzz` Fider project, which will result in a URL of `xyzfider.pathfinder.gov.bc.ca`.

```bash
export F=xyzfider
oc -n b7cg3n-deploy new-app --file=./openshift/postgresql.dc.json -p FEEDBACK_NAME=$F
sleep 60s

oc -n b7cg3n-deploy rsh $(oc -n b7cg3n-deploy get pods | grep $F-postgresql- | grep Running | awk '{print $1}')
psql ${POSTGRESQL_DATABASE}  -c "ALTER USER ${POSTGRESQL_USER} WITH SUPERUSER"
exit

oc -n b7cg3n-deploy new-app --file=./openshift/fider.dc.json -p FEEDBACK_NAME=$F
sleep 30s

oc -n b7cg3n-deploy rsh $(oc -n b7cg3n-deploy get pods | grep $F-postgresql- | grep Running | awk '{print $1}')
psql ${POSTGRESQL_DATABASE}  -c "ALTER USER ${POSTGRESQL_USER} WITH NOSUPERUSER"
exit

unset F
```

3b To reset all deployed objects (this will destroy all data and persistent volumes). Only do this on a botched initial install or if you have the DB backed up and ready to restore into the new wiped database.  
`oc -n b7cg3n-deploy delete all,secret,pvc -l app=$F`

## TODO

* test DB backup/restore and transfer
* health checks for application containers
* create fider.bc.json file
* convert ./openshift/*.json to *.yml
* test out application upgrade (e.g. Fider updates their version)
* check for image triggers which force a reploy (image tags.. latest -> v0.19.0)
* appropriate resource limits (multi pods supported)

### Done

* integrated with apps.smtp.gov.bc.ca:25 without TLS (e.g. x509 error due to vwall.gov.bc.ca on cert)
* health checks for each of the database container

## SMTPS Issue

1. When configured with apps.smtps.gov.bc.ca

```bash
ERROR [2019-11-30T02:54:11Z] [WEB] [6N0EEiyyCVMpNWxD3w9N7J6XjVnlFT6Y] Error Trace: 
- app/handlers/apiv1/invite.go:31
- failed to send email with template invite_email (app/pkg/email/smtp/smtp.go:104)
- x509: certificate is valid for vwall.gov.bc.ca, www.vwall.gov.bc.ca, not apps.smtp.gov.bc.ca
```

2. When using straight non-TLS STMP connection

```bash
ERROR [2019-11-30T03:17:59Z] [WEB] [7g7GXPSR57065JvQYioR9nvj7Z7Zy0pJ] Error Trace: 
- app/handlers/apiv1/invite.go:31
- failed to send email with template invite_email (app/pkg/email/smtp/smtp.go:104)
- dial tcp 74.125.20.108:587: connect: connection timed out
```

I suspect `apps.smtp.gov.bc.ca` starts the TLS handshake which tells Fider SMTP utility to expect a properly configured SSL Certificate.
