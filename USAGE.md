# Mines Digital Services

## Installation and Usage

This file describes how to run the project and develop against it.

## Requirements

* Docker
* Makefile

## Getting Started (OSX and LINUX)

* Install Docker and Makefile
* Define .env files in frontend and backend folders

* Run the following command to build and run the project using Docker.
```
make project
```

* Run the following command to create a local user with credentials `admin:admin`
```
make keycloak-seed
```
NOTE: The above command only works after the keycloak server has started. If you see
any errors, wait a couple of minutes and then try again.

## Getting Started (Windows)

* Install Docker
* Define .env files in frontend and backend folders
* Install node.js  8 (https://nodejs.org/en/)
* Install node-gyp from an elevated command prompt
```
npm install --global --production windows-build-tools
```
* Download GTK 2 and extract it to C:\GTK
```
http://ftp.gnome.org/pub/GNOME/binaries/win64/gtk+/2.22/gtk+-bundle_2.22.1-20101229_win64.zip
```
* Install canvas globally
```
npm install --global --production canvas
```
* Run docker commands to build and run
```
docker-compose build --force-rm
docker-compose up -d
```
* Create local admin user
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

### Container Information
* The backend container exposes port 5000 and can be viewed by visiting http://localhost:5000
* The frontend container exposes port 3000 and can be accessed at http://localhost:3000
* The Postgres container exposes port 5432 and can be connected to with the admin account (mds/test); for example:
```
psql --dbname=mds --username=mds --host=localhost --password --port=5432
```