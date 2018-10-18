# Mines Digital Services

## Installation and Usage

This file describes how to run the project and develop against it.

## Requirements

* Docker
* Makefile
* IDIR Account (Contact repository owner for a valid IDIR account to be able to access the application locally)

## Getting Started (OSX and LINUX)

* Run the following command to build and run the project.
```
make project
```

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

## Generating Test Data

```
docker exec -it mds_backend bash
flask create_data 1000
exit
```

### Container Information
* The backend container exposes port 5000 and can be viewed by visiting http://localhost:5000
* The frontend container exposes port 3000 and can be accessed at http://localhost:3000
* The Postgres container exposes port 5432 and can be connected to with the admin account (mds/test); for example:
```
psql --dbname=mds --username=mds --host=localhost --password --port=5432
```
