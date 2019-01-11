# Mines Digital Services

## Installation and Usage

This file describes how to run the project and develop against it.

## Requirements

- Docker
- Makefile

## Getting Started (OSX and LINUX)

- Install Docker and Makefile
- Define .env files in frontend and backend folders

- Run the following command to build and run the project using Docker.

```
make project
```

NOTE: By default the above command uses Keycloak hosted on the OpenShift Platform.
If you don't have a valid account to access that and would like to use a local keycloak server, refer to the local keycloak section below.

- To shut down the project cleanly, run the following command.

```
make reset
```

## Getting Started (Windows)

- Install Docker
- Define .env files in frontend and backend folders
- Install node.js 8 (https://nodejs.org/en/)
- Run docker commands to build and run

```
docker-compose build --force-rm
docker-compose up -d
```

- Create local admin user

```
docker exec -it mds_keycloak /tmp/keycloak-local-user.sh
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

## Setting up local keycloak

1.  Update your .env for both frontend and backend to point to local keycloak. - For frontend edit the `keycloak_url` in `frontend/src/constants/environment.js` and change the host from
    `https://sso-test.pathfinder.gov.bc.ca` to `http://keycloak:8080`

        - For Backend edit the .env file and update the following envt variables.
            ```
            export JWT_OIDC_WELL_KNOWN_CONFIG=http://keycloak:8080/auth/realms/mds/.well-known/openid-configuration
            export JWT_OIDC_AUDIENCE=account
            ```

2.  Add the following entry in your hosts file.
    OSX (/etc/hosts) Windows (C:/Windows/System32/Drivers/etc/hosts)

```
127.0.0.1	localhost	keycloak
```

3. Rebuild all your images to have the new envt.

```
make clean
make project
```

4. Run the following command to create a local user with credentials `admin:admin`

```
make keycloak-user
```

NOTE: The above command only works after the keycloak server has started. If you see
any errors, wait a couple of minutes and then try again.

### Container Information

- The backend container exposes port 5000 and can be viewed by visiting http://localhost:5000
- The frontend container exposes port 3000 and can be accessed at http://localhost:3000
- The Postgres container exposes port 5432 and can be connected to with the admin account (mds/test); for example:

```
psql --dbname=mds --username=mds --host=localhost --password --port=5432
```
