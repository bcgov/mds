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
make backend
```

## Flask Click commands

Flask supports [click commands](http://flask.pocoo.org/docs/1.0/cli/) which
lets you run one-off commands from the command line without having to run the
complete app.

To see the list of all click commands, checkout `register_commands` method
under the `__init__.py` file.

### Click commands workflow to transfer files to the object store 
*Pre-requisite to running the transfer-files, verify-files, and reorganize-files commands: ensure that a Celery worker is running. You can use the command `ps aux` to check.

**I want to transfer all documents that exist on the filesystem to the object store**
    **1.** Get a list of untransferred files:
        `flask untransferred-files`
    **2.** Transfer those files to the object store:
        `flask transfer-files`
    You can view the output of the task in the celery logfile.
    **3.** Check the result of the transfer in the logfile or in the result backend. Act accordingly depending on the status of the job.
    **4.** Get a list of untransferred files:
        `flask untransferred-files`
    If the previous transfer task was successful, this list should be empty. If it contains documents, you should see the reason why in the job results.
    **5.** Double-check that the transfer task was successful and that all locally-stored files match their corresponding files on the object store:
        `flask verify-files`
    If you want, log into Cyberduck or another tool to view the files that were transferred to the object store.

See [here](https://github.com/bcgov/mds/pull/1380) for a more detailed instructional workflow.

## Testing

The application uses `pytest` to run the tests and `coverage` to output the
results. The testing structure is based around [flask testing
documentation.](http://flask.pocoo.org/docs/1.0/testing/)

To run tests, use the following command:
```
coverage run --branch --source=app -m pytest
```
