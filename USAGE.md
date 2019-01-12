# Mines Digital Services

## Installation and Usage

This file describes how to run the project and develop against it.

## Requirements

- Docker
- Make
- NodeJS 8.0.0

## Getting Started

- Install Requirements listed above
- On Windows, note the following:
    - If containers are not working, they may not be enabled, enabling them in docker settings and restarting the machine fixes this
    - Drive sharing is disabled by default, make sure to share your local drive in docker settings

## Setting up local keycloak
Note: you can skip this step if you have a valid account to access the Keycloak server hosted on the OpenShift Platform

1.  Update your .env for both frontend and backend to point to local keycloak. Make sure to use HTTP and not HTTPS

- This can be done with the `apply-local-dev-settings.ps1` and `apply-local-dev-settings.sh` scripts found in the root directory, if you use one of these, then skip to step 2

- For frontend edit the `keycloak_url` in `frontend/src/constants/environment.js` and change the host from
    `https://sso-test.pathfinder.gov.bc.ca` to `http://keycloak:8080`

- For Backend edit the .env file and update the following envt variables.

`export JWT_OIDC_WELL_KNOWN_CONFIG=http://keycloak:8080/auth/realms/mds/.well-known/openid-configuration`

`export JWT_OIDC_AUDIENCE=account`

2.  Add the following entry in your hosts file.
    OSX/Linux (/etc/hosts) Windows (C:/Windows/System32/Drivers/etc/hosts)

```
127.0.0.1	localhost	keycloak
```

## Building MDS
Note: If working on a Windows environment such as an Azure VM, there is a powershell script `mds.ps1` in the root directory, that will wait for Docker to start, and automatically do the steps below. Run this script whenever you restart the machine, otherwise things don't work

1. Rebuild all your images to have the new envt.

```
make clean
make project
```

2. Run the following command to create a local user with credentials `admin:admin`

```
make keycloak-user
```

NOTE: The above command only works after the keycloak server has started. If you see
any errors, wait a couple of minutes and then try again.

NOTE: It will take quite a bit longer for the other servers to start up, give it about 5 minutes before the frontend and backend are properly online.

- To shut down the project cleanly, run the following command.

```
make reset
```

## Generating Test Data

```
docker exec -it mds_backend bash
flask create_data 1000
exit
```

## Seeding data with Test environment Database

NOTE: You need access to the Test Openshift environment and oc cli tools.

```
docker exec -it mds_postgres pg_restore -U mds -d mds -c /tmp/pgDump-test.pgCustom
```



### Container Information

- The backend container exposes port 5000 and can be viewed by visiting http://localhost:5000
- The frontend container exposes port 3000 and can be accessed at http://localhost:3000
- The Postgres container exposes port 5432 and can be connected to with the admin account (mds/test); for example:

```
psql --dbname=mds --username=mds --host=localhost --password --port=5432
```
