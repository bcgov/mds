# Mines Digital Services

## Installation and Usage

This file describes how to run the project and develop against it.

## Requirements

- Docker
- Make
- NodeJS 10

## Getting Started

- Install Requirements listed above
- On Windows, note the following:
    - If containers are not working, they may not be enabled, enabling them in docker settings and restarting the machine fixes this
    - Drive sharing is disabled by default, make sure to share your local drive in docker settings

## Setting up local development

Keycloak needs to be set up for the application to run properly, a keycloak user (admin/admin) needs to be made, and we need some test data.


Run the following commands after cloning the repo.  The first command will do a one-time setup of your environment so that you can do all your development locally.

```
make local-dev
```

Make sure your local docker is up and running before running the next step.

Every time you wish to have a completely fresh environment, with MDS user admin/admin and random data, run the following:

```
make rebuild-all-local
```

NOTE: It will take quite a bit longer for the other servers to start up, give
it about 5 minutes before the frontend and backend are properly online.

You are now ready to proceed to the section 'Developing workflow tips for MDS'


## Generating Test Data

There are two approaches to having test data in your system.  If you are a
public contributor, choose "Using Flask". View the Makefile for more
information on what these commands are doing. This is useful for
troubleshooting if anything fails to work as expected.

### Using Flask

This will connect to a locally running docker postgres instance and generate
1000 mine records with random data.  This has already been done for you in the
rebuild-all-local step, but if you need more data:

```
make generate-rand1000
```

or if you require less data...

```
make generate-rand100
```

### Seeding data with Test environment Database

NOTE: You need access to the Test Openshift environment and oc cli tools.

```
make database-seed
```

## Developing workflow tips for MDS

If you are planning to run the frontend on your host machine, ensure you are
using Node 10 (lts/dubnium) and npm 6. You may choose to use a version manager
such as [nvm](https://github.com/nvm-sh/nvm).

### Browser Caching

If you are rebuilding often, you will have to deal with caching issues in your
browser.

You can address this by:

- Periodically clear the cache.
- Disable cache (available in Chrome/Chromium)
- Open an Incognito window (Chrome/Chromium)

If you have made changes to the backend:


### Container Information

- The mds_backend container exposes port 5000 and can be viewed by visiting http://localhost:5000
- The mds_frontend container exposes port 3000 and can be accessed at http://localhost:3000
- The mds_keycloak container exposes port 8080 and can be accessed at http://keycloak:8080
- The mds_postgres container exposes port 5432 and can be connected to with the admin account (mds/test); for example:

```
psql --dbname=mds --username=mds --host=localhost --password --port=5432
```

## Architecture Diagrams

![High Level Architecture](https://user-images.githubusercontent.com/25966613/51941464-83e91500-23c9-11e9-8a02-fa17a91c8411.png)

## Authentication Workflow

![KeyCloak Authentication / Authorization](https://user-images.githubusercontent.com/25966613/52016147-a302a800-2498-11e9-87ce-e59bd0464656.png)
