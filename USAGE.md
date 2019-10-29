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

### Setting up local development

If you are developing without an IDIR, or if remote Keycloak is down, you'll
need to run a local Keycloak instance. The local development environment is
based on `.env-dev-local-keycloak`. You can make a copy of this file as `.env`
and/or run the following command to set up a local Keycloak instance.

```
make local-dev
```

If you wish to have a completely fresh environment, you can run the following
command at any time:

```
make rebuild-all-local
```

NOTE: Always wait for all commands to complete before running subsequent
commands.

### Troubleshooting

Should anything go awry with the above commands, you may wish to isolate the
failure by running individual commands. A common setup for contributors is to
run the frontend on the host machine and everything else in Docker. To do so,
execute the following commands:

```
$ make clean
$ make keycloak
$ make backend
$ make keycloak-user
$ make generate-rand100
```

The backend is now running and seeded with random data. Run the following
commands from within the `/frontend` directory to initialize the frontend:
```
$ npm ci
$ npm run serve
```


## Generating Test Data

There are two approaches to having test data in your system.  If you are a
public contributor, choose "Using Flask". View the Makefile for more
information on what these commands are doing. This is useful for
troubleshooting if anything fails to work as expected.

### Using Flask

This will connect to a locally running docker postgres container
(`mds_postgres`) and generate 1000 mine records with random data. This has
already been done for you in the rebuild-all-local step, but if you need more
data:

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
such as [nvm](https://github.com/nvm-sh/nvm) if working on multiple projects.

### Browser Caching

If you are rebuilding often, you may encounter browser caching.

To address this, you may:

- Periodically clear the cache.
- Disable cache (available in Chrome/Chromium)
- Open an Incognito window (Chrome/Chromium)


### Container Information

- The mds_backend container exposes port 5000 and can be viewed by visiting http://localhost:5000
- The mds_frontend container exposes port 3000 and can be accessed at http://localhost:3000
- The mds_keycloak container exposes port 8080 and can be accessed at http://keycloak:8080
- The mds_postgres container exposes port 5432 and can be connected to with the admin account (mds/test); for example:

```
psql --dbname=mds --username=mds --host=localhost --password --port=5432
```

## Architecture Diagrams

![High Level Architecture](./docs/MDS_Arch.png)

## Authentication Workflow

![KeyCloak Authentication / Authorization](https://user-images.githubusercontent.com/25966613/52016147-a302a800-2498-11e9-87ce-e59bd0464656.png)
