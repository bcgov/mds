# Mines Digital Services

## Installation and Usage

This file describes how to run the project and develop against it.

## Requirements

- Git
- Docker
- Docker Compose
- NodeJS
- [Make](https://www.gnu.org/software/make/manual/make.html)

## Getting Started

- Install Requirements listed above
- On Windows, note the following:
  - If containers are not working, they may not be enabled, enabling them in docker settings and restarting the machine fixes this
  - Drive sharing is disabled by default, make sure to share your local drive in docker settings

### Developing with M1 Mac

To develop with M1 Mac, there are no additional requirements.

The make file supports context switching based on the CPU architecture of the machine host.

If you require to run additional docker-compose commands, use `docker-compose` with `-f` flag pointing to `docker-compose.M1.yaml`

### Setting up Local Development

#### Initializing the Project

The following steps should only need to be completed **once**. Run the following commands from the project root directory. Wait for each command to complete before running the next.

- `make valid` on the host machine to make sure you have YARN and Node in the right versions.
- `make env` to update the environment variables.
- `yarn install` (or `yarn`) This will use the monorepo `yarn.lock` to install dependencies. It will hoist `node_modules` to the root of the repo with very few dependencies inside of the services folders. Any new dependencies you want to add use yarn workspaces command.
- `make be` to spin up all backend dependencies.
- `make seeddb` to seed the database with factory data.
- **GitHub CodeSpaces**: `make init` can be run instead of the above commands to run all of them, but this feature is experimental and more likely to fail, especially outside of a CodeSpaces environment.

#### Restarting the Project

After initializing the project, run the following commands to restart the application. Note that `yarn watch` and `yarn serve` commands should each be run in a separate window.

- `nvm use` if using the `.nvmrc` file to manage Node versions (this will need to be repeated in any new terminals that are opened).
- `make be` this will not be necessary if you have just completed the steps to initialize the project for the first time.
  - `make rebuild` can be run to rebuild your backend containers. Note that this does not work well on CodeSpaces.
- `cd services/common && yarn watch` will watch for changes.
- `cd services/core-web && yarn serve` to serve the core-web application on `localhost:3000`
- `cd services/minespace-web && yarn serve` to serve the minespace-web applicatioin on `localhost:3020`
- **GitHub CodeSpaces**: `make restart` can be run instead of the above commands to run all of them- it runs all the yarn commands as background processes in the same terminal window. This feature is experimental and designed specifically for CodeSpaces but is generally safe to run on local environments.

To stop the application:

- end any terminal processes running `yarn` commands to stop the frontend.
- run `make stop` to stop the backend containers.

#### Additional Setup

##### Minespace

Minespace will have no mines assigned to the user, and this is simplest to perform through the UI.
NOTE: To avoid SSO conflicts, it is recommended to log into CORE and Minespace in separate browsers, or to Minespace in an incognito window.

- First attempt to log into Minespace with your BCeID so that your user will be created in the database.
- Log into CORE with your IDIR
- Navigate to Admin → Core Administrator → Minespace Management → Users
- Under Create Proponent, enter your bceid (“user@bceid”) or email address.
- Select some Mines, and click Create Proponent

##### Notifications & Emails

- **Core**: you must subscribe to mines in order to receive notifications or emails about them (pick a mine, click on Options, then Subscribe)
- **Minespace**: any Mines that you are assigned as above (displayed in My Mines) you will be subscribed to
- **Emails**: To enable emails, modify the `services/core-api/.env` file as follows, then restart the `mds_backend` container to apply the changes:
  - `EMAIL_ENABLED=1`
  - `EMAIL_RECIPIENT_OVERRIDE=your@email.address`- outside of prod, emails can only be sent to this address

### Troubleshooting

Should anything go awry with the above commands, you may wish to isolate the failure by running individual commands.

1. Delete any existing `node_modules` in minespace, core-web, root of the repo etc.
2. Make sure that you are running the correct node version. Run `make valid` to validate your environment or `node -v` to check your version and `nvm use` to use the project version.
3. Run `yarn` to update any dependencies.
4. If you have recently switched between different branches, you may need to recreate `.env` files by running `make env` or check the logs in the `mds_flyway` container for migration validation errors.
5. Docker: Docker Desktop should be running for local development.
   - Docker errors: kill & restart the docker process in a unix environment:
   - `ps -aux | grep dockerd` to find the `DOCKER_PROCESS_ID`
   - `kill -9 DOCKER_PROCESS_ID` to end the process
   - `sudo dockerd` to restart the process

## Developing workflow tips for MDS

You may choose to use a version manager such as [nvm](https://github.com/nvm-sh/nvm) or [asdf](https://asdf-vm.com/) if working on multiple projects.

### Browser Caching

If you are rebuilding often, you may encounter browser caching.

To address this, you may:

- Periodically clear the cache.
- Disable cache (available in Chrome/Chromium)
- Open an Incognito window (Chrome/Chromium)

### Using the Document Manager and Document Generator locally

If you are running the frontend using `yarn serve` then you will not be able to use the document manager at the same time as the document generator. If you wish to do this then you need to make an addition to your hosts file so the browser can resolve the document_manager_backend to localhost. You can verify that this is working by navigating to `http://document_manager_backend:5001/` where Swagger documentation should be displayed.

Note that this process does not work on CodeSpaces environments and a suitable process has not been found.

If you are on a windows machine ensure that you open powershell in administrator mode as that is required to modify the hosts file and run the following command at the root of this project:

```
.\AddHosts.ps1 -Hostname document_manager_backend -DesiredIP 127.0.0.1 -CheckHostnameOnly $true
```

This will add an entry for the document manager backend if it does not currently exist.

On a mac or linux run the following:

```
sudo ./AddHosts.sh add 127.0.0.1 document_manager_backend
```

you will be prompted for your sudo password if the entry does not already exist.

## Architecture Diagrams

![High Level Architecture](./docs/architecture/MDS_Arch-Arch.svg)

## Authentication Workflow

![KeyCloak Authentication / Authorization](https://user-images.githubusercontent.com/25966613/52016147-a302a800-2498-11e9-87ce-e59bd0464656.png)
