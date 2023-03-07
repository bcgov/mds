# Backend API

The project uses a Python 3.6 runtime environment and [Flask
REST-plus](https://flask-restplus.readthedocs.io/en/stable/) framework for the
API.

The application uses SQLAlchemy as our ORM to interact with the database.

For the application directory structure, see [flask-RESTplus quickstart
guide.](https://flask-restplus.readthedocs.io/en/stable/quickstart.html)

## Directory/Naming convention

The application directory is structured as follows:

```
|-- app
    |-- api
        |-- NAMESPACE_MODULE_NAME
            |-- Namespace (Contains api namespace)
            |-- MODULE_NAME
                |-- Models (Contains all the database model definition used by SQLAlchemy)
                |-- Resources (Contains all the routes and views to handle incoming requests)
    |-- utils (Contains utility shared across modules)
|-- tests (Unit/Integration tests for the application)
|-- app.sh (Shell script used by the python OpenShift s2i image to run the application)
|-- Dockerfile (Dockerfile for running the application locally using Docker)
|-- requirements.txt (Libraries required by the project)
```

## Pre-requisites and Installation

If running on your host machine, the application assumes you already have a
working postgres DB with the required schema and tables and have the connection
details in the .env file.

Follow the `.env-example` template to create an `.env` file with valid values
before running the application.

A. OS Level Installation

- [Python 3.6](https://www.python.org/downloads/release/python-360/)
- [Pip](https://pypi.org/project/pip/)
- [Virtualenv](https://virtualenv.pypa.io/en/stable/)

1. Create a virtual environment with python 3.6 and activate it

```
virtualenv -p python3.6 .venv
source .venv/bin/activate
```

2. Install the requirements

```
pip install -r requirements.txt
```

NOTE: For Ubuntu/Debian based systems, you may have to install libpq-dev. You can do this via:

sudo apt install libpq-dev

https://stackoverflow.com/questions/11618898/pg-config-executable-not-found

3. Run the application

```
flask run
```

B. Using a docker container

- [Docker](https://www.docker.com/)

1. Switch current directory to the project root

```
cd ../
```

2. Issue the makefile command that runs the backend

```
make be
```

## Flask Click commands

Flask supports [click commands](http://flask.pocoo.org/docs/1.0/cli/) which
lets you run one-off commands from the command line without having to run the
complete app.

To see the list of all click commands, checkout `register_commands` method
under the `__init__.py` file.

## Document Generator Service

The MDS document generator service makes use of the Common Services team's [Document Generator Service](https://github.com/bcgov/common-services-team-library/tree/master/images/doc-gen-api/app).

### Click commands workflow to transfer files to the object store

\*Pre-requisite to running the transfer-files, verify-files, and reorganize-files commands: ensure that a Celery worker is running. You can use the command `ps aux` to check.

**I want to transfer all documents that exist on the filesystem to the object store**

1.  Get a list of untransferred files:
    `flask untransferred-files`
2.  Transfer those files to the object store:
    `flask transfer-files`
    You can view the output of the task in the celery logfile.
3.  Check the result of the transfer in the logfile or in the result backend. Act accordingly depending on the status of the job.
4.  Get a list of untransferred files:
    `flask untransferred-files`
    If the previous transfer task was successful, this list should be empty. If it contains documents, you should see the reason why in the job results.
5.  Double-check that the transfer task was successful and that all locally-stored files match their corresponding files on the object store:
    `flask verify-files`
    If you want, log into Cyberduck or another tool to view the files that were transferred to the object store.

See [here](https://github.com/bcgov/mds/pull/1380/) for a more detailed instructional workflow.

## Testing

The application uses `pytest` to run the tests and `coverage` to output the
results. The testing structure is based around [flask testing
documentation.](http://flask.pocoo.org/docs/1.0/testing/)

To run tests, use the following command:

```
coverage run --branch --source=app -m pytest
```

## Working with SSO Providers:

#### History of SSO Implementations on MDS:

V1:

MDS was originally working with a custom keycloak instance (hosted on openshift?) and a local keycloak container for development. This was hard to work with locally and maintain (patching, upgrades etc..)

V2:

The project then moved on to shared keycloak instance (silver SSO) hosted by the platform team and the shared instance had multiple realms provisioned for each ministry division / program.

Benefits:

- Not having to maintain the keycloak instance (the platform team does it for us)
- Having a full realm with admin access, the team could configure and control the parameters as required

There were several issues with this approach for the platform team (it was great for teams that had full realms though!)

Cons:

- Having a large number of realms on keycloak created severe performance penalty as the number of projects kept getting higher.
- Most teams required the same features (IDIR, BCeID login) but had different implementations.
- Some teams required specalized features that needed instance level changes (hard coupling)

Since most projects need the standard setup anyways, it was decided to move to an offering that does the basic things very well and specialized requirements will be handled by the teams themselves, with custom keycloak implementations.

[Read More about standard service here](https://github.com/bcgov/sso-keycloak/wiki#standard-service)

V3:

MDS requirements falls under the standard service category so we have to migrate to Gold SSO.

[Gold SSO](https://bcgov.github.io/sso-requests) fundamentally differs from silver by offering `Clients` instead of an entire `Realm`, this way the implementation is standardized.

Notable implementation details of Gold SSO:

- All projects on Gold SSO get clients per project / webapp or integration.
- Each client has role management within the context of the client.

Cons:

- Roles cannot be shared across clients
- BC Service Card login is not supported
- Service Accounts do not have ability to get roles (Future backlog item)

#### MDS SSO Manager Implementation:

We need to support multiple SSO providers using JWT manager (existing silver and the new gold sso) because of few reasons:

Technical reasons:

- Each integration client has a different `audience` attribute. Earlier in the `mds` realm, each client, service account had the same `audience` attribute.
- The property where the client scope is seeded is defaulted to

Other reasons:

- We need to provide sufficient time for our integration partners to move to a new client credential and sso provider.
- Gold SSO is not feature complete and able to support roles for service accounts yet.

In order to handle the above cases, we have a jwt-manager implementation that works with multiple OIDC audiences and configurations.

core-api currently works with the following sso providers.

1. Gold SSO - [All Environments](https://bcgov.github.io/sso-requests/my-dashboard/integrations)
2. Silver SSO - [Test](https://test.oidc.gov.bc.ca/auth/admin/mds/console/#/realms/mds) and [Production](https://oidc.gov.bc.ca/auth/admin/mds/console/#/realms/mds)

Both Gold and Silver SSO is based off [Keycloack IDM](https://www.keycloak.org/)

The SSO login is used for authentication and role assignments for all of MDS users.

#### Adding new sso client:

- Create a new integration in Gold SSO or a new client in any OIDC authentication provider.
- Add the audience and well known config for the OIDC provider as environment variables for `core-api`
- Create an instance of the JwtManager for every OIDC provider in `extensions.py` of `core-api`
- Initialize the provider in `__init__.py` of `core-api`
- Update `getJwtManager` for switching to the correct provider based on the jwt token
