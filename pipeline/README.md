# OpenShift/Jenkins Pipeline

Collection of groovy scripts to help run jobs in a Jenkins pipeline.

This folder contains following:
- gradle : Directory containing gradle dependencies and runtime wrapper jar
- src/groovy : Groovy files containing the runtime code for different build steps in the pipeline
- build.gradle : Build configuration for the gradle runner
- config.groovy : Configuration file containing information regarding different deployment environments in the pipeline
- gradlew(.bat) : Gradle runner executable

Do not put any confidential/secret key into the config.groovy file as it gets checked
into the git repository.

## Library Dependency
The scripts all inherit base classes from the [BCDevops/ocp-cd-pipeline](https://github.com/BCDevOps/ocp-cd-pipeline)


## Github Flow

We follow the [Feature branches workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow). But instead of the develop branch, we use Sprint branches which are merged into master at the end of each sprint and a new Sprint branch is created. In other words, at the end of every sprint, new features are released.

### Branch names:
- SprintYEAR.SPRINT_NUMBER (e.g. Sprint2018.5) : Current release branch
- fix/JIRA_TICKET_NUMBER (e.g. fix/MDS-32) : For any minor fixes.
- feature/JIRA_TICKET_NUMBER (e.g. feature/MDS-32) : For any minor fixes.

### Pull requests:
All the pull requests should be opened against the current release branch. To be mindful of OpenShift resources, PR's should only be opened when they are ready to receive feedback so they can be merged.

Use Github labels to communicate your branch status to other team members and assign reviewers when you are ready to receive feedback.

Before merging your PR to the release branch, remember to Squash all the commits into one and provide a bullet point description of the highlights for that branch.

## Pipeline steps

The project uses a CI/CD workflow.

The CI flow is triggered when a PR is opened against the release branch:

- Build -> Deploy to Dev -> Unit Tests -> ZAP -> Acceptance -> End

The CD flow is triggered when a PR is opened against the master branch:

- Build -> Deploy to Dev -> Unit Tests -> ZAP -> Deploy to TEST -> Functional Tests -> Deploy to PROD -> Acceptance -> End

User input is required for the Acceptance and Deploy to PROD steps.