# OpenShift environment configuration

This project uses OpenShift container platform (v3.10) for hosting the application and deploying/running any services required by it.

## Environments

There are 4 environments setup in OpenShift Platform.

- Tools : Contains all the tools/external services required by the application
- Dev : Contains a running application instance of an open pull request branch.
- Test : Contains a running application instance of the current release branch.
- Prod : Contains a running application instance of the current state of master.

## Filename Convention

Files are named with the following convention in mind:

- APPLICATION.bc.json: Build configuration for the application. Used for building any images required by the deployment configuration.

- APPLICATION.dc.json: Deployment configuration for the application. These deployment pods are long lived.

- APPLICATION.pod.json: Deployment configuration for the application. These deployment pods are usually short lived and run one off jobs.

## Application Components

### Tools

- Jenkins

Jenkins is being used to orchestrate jobs between Github and OpenShift. Anytime a PR is open against the release/master branch it triggers a job on Jenkins which runs the pipeline stages and reports the status back to Github.

[Link to Documentation](https://docs.openshift.com/container-platform/3.10/using_images/other_images/jenkins.html)

[Link to the jenkins s2i image](https://github.com/BCDevOps/openshift-components/tree/master/cicd/jenkins)

- SonarQube

SonarQube is being used to ensure code quality and test coverage is up to date.

[Link to Documentation](https://docs.sonarqube.org/display/SONAR/Documentation)

- ZAP

OWASP ZAP is being used to check for network penetration and find security vulnerabilities.

[Link to Documentation](https://www.owasp.org/index.php/OWASP_Zed_Attack_Proxy_Project)

### App

- Postgres

The app uses a PostgresSQL database to store and retrieve data from. The base image is a modified s2i image that included oracle foreign data wrapper extension to fetch data from a remote oracle database instance, and also the pgcrypto and postGIS extensions.

[Link to s2i image](https://github.com/bcgov/openshift-postgresql-oracle_fdw)

- Python 3.6

The app uses a Python (v3.6) environment to create a REST API that handles interaction between the frontend and the database.

[Link to s2i image](https://github.com/sclorg/s2i-python-container/tree/master/3.6)

- Nodejs 10

The app uses a Nodejs (v10) runtime environment to run the frontend.

[Link to s2i image](https://github.com/sclorg/s2i-nodejs-container/tree/master/10)

- Schemaspy

The app uses schemaspy to output current database schema metadata that can be accessed through a URL.
