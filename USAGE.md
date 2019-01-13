# Mines Digital Services

## Installation and Usage

This file describes how to run the project and develop against it.

## Requirements

- Docker
- Make
- NodeJS 8.0.0

## Hosts file entry

Add the following entry in your hosts file.  The file location for OSX/Linux is "/etc/hosts" and on Windows is typically "C:/Windows/System32/Drivers/etc/hosts".  Ensure the following line containing the entry keycloak is present:

```
127.0.0.1	localhost	keycloak
```

## Getting Started

- Install Requirements listed above
- On Windows, note the following:
    - If containers are not working, they may not be enabled, enabling them in docker settings and restarting the machine fixes this
    - Drive sharing is disabled by default, make sure to share your local drive in docker settings

## Setting up local development

Keycloak needs to be set up for the application to run properly, a keycloak user needs to be made, and we need some test data.

Run the following commands after cloning the repo.  The first command will do a one-time setup of your environment so that you can do all your development locally.

```
make local-dev
```

Now every time you wish to have a completely fresh environment, with user admin/admin and random data, run the following:

```
make rebuild-all-local
```
Note: If working on a Windows environment, there is a powershell script `mds.ps1` in the root directory, that will wait for Docker to start, and automatically do the step above. Run this script whenever you restart the machine, otherwise things don't work. To run the script, open Powershell and run:
```
.\mds.ps1
```


## Building MDS

If you have run the above setups, you should be ready to proceed to "Developing with MDS".  Otherwise if you haven't, or if you are on a mac or linux system, follow the next steps:

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


## Generating Test Data

There are two approaches to having test data in your system.  If you are a public contributor, choose "Using Flask".

### Using Flask

This will connect to a locally running docker postgres instance and generate 1000 mine records with random data.

```
make generate-rand1000
```

### Seeding data with Test environment Database

NOTE: You need access to the Test Openshift environment and oc cli tools.

```
docker exec -it mds_postgres pg_restore -U mds -d mds -c /tmp/pgDump-test.pgCustom
```

## Developing workflow tips for MDS

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

- The backend container exposes port 5000 and can be viewed by visiting http://localhost:5000
- The frontend container exposes port 3000 and can be accessed at http://localhost:3000
- The Postgres container exposes port 5432 and can be connected to with the admin account (mds/test); for example:

```
psql --dbname=mds --username=mds --host=localhost --password --port=5432
```

