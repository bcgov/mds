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

NOTE: It will take quite a bit longer for the other servers to start up, give it about 5 minutes before the frontend and backend are properly online.

You are now ready to proceed to the section 'Developing workflow tips for MDS'


## Generating Test Data

There are two approaches to having test data in your system.  If you are a public contributor, choose "Using Flask".

### Using Flask

This will connect to a locally running docker postgres instance and generate 1000 mine records with random data.  This has already been done for you in the rebuild-all-local step, but if you need more data:

```
make generate-rand1000
```

or if you require less data...

```
make generate-rand100
```

The above commands generate random data.  For data from the test system, the alternative approach below will also provide you with data.

### Seeding data with Test environment Database

NOTE: You need access to the Test Openshift environment and oc cli tools.

```
docker exec -it mds_postgres pg_restore -U mds -d mds -c /tmp/pgDump-test.pgCustom
```

## Developing workflow tips for MDS

If you are rebuilding often, you will have to deal with caching issues in your browser.

In Chrome/Chromium, you can right-click on the page, choose "inspect", then right-click on the refresh icon next to the URL bar and choose hard reset.

Another way is using the Inspector window, Network top menu entry, check "Disable Cache" and it will run without using the cache as long as the inspector is open.

Or you can open an Incognito window and that should not have cached data in it.

Typically one does not wish to run a full 'make project' for every little change.  This will wipe out your test data and local keycloak users.

Have a look in the file called "Makefile" to see all the helpful aliased make targets for rebuilding whichever part of the application you are currently working in.  

For example, if you have made some changes in the frontend, use the make target:
```
make frontend
```

Same if you have made changes to the backend:
```
make backend
```

If you have made changes to the database you will need to reapply the above commands in section "Generating Test Data":
```
make database
```

To shut down the project cleanly, run the following command.
```
make reset
```

There are plenty more make targets to use in the Makefile, so be sure to look there first as if it's a common development operation then it is most likely there.


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

![KeyCloak Authentication / Authorization](![mds-keycloak](https://user-images.githubusercontent.com/25966613/52016147-a302a800-2498-11e9-87ce-e59bd0464656.png)
