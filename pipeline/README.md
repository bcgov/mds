# OpenShift/Jenkins Pipeline

Collection of groovy scripts to help run jobs in a Jenkins pipeline.

```
|-- gradle (Directory containing gradle dependencies and runtime wrapper jar)
|-- src (Source code of the application)
    |-- groovy (Groovy files containing the runtime code for different build steps in the pipeline)
|-- build.gradle (Build configuration for the gradle runner)
|-- config.groovy (Configuration file containing information regarding different deployment environments in the pipeline)
|-- gradlew(.bat) (Gradle runner executable)
```

## Library Dependency
The scripts all inherit base classes from the [BCDevops/ocp-cd-pipeline](https://github.com/BCDevOps/ocp-cd-pipeline)


## Git Flow

We follow a modified version of [Feature branches
workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow).
We have a long-living `develop` branch, from which feature branches are
created. The `develop` branch is deployed directly to TEST and then to PROD if
TEST has no apparent regressions. After deploying to PROD, `develop` is merged
into `master` and then `master` is merged back into `develop` (to avoid
commit-hash-related conflicts).

### Branch names:
- SprintYEAR.SPRINT_NUMBER (e.g. Sprint2018.5) : Current release branch
- fix/JIRA_TICKET_NUMBER (e.g. fix/MDS-32) : For any minor fixes.
- feature/JIRA_TICKET_NUMBER (e.g. feature/MDS-32) : For any minor fixes.

### Pull requests:
All the pull requests should be opened against the `develop`. To be mindful of
OpenShift resources, PR's should only be opened when they are ready to receive
feedback so they can be merged.

Use Github labels to communicate your branch status to other team members and
assign reviewers when you are ready to receive feedback.

Before merging your PR to `develop`, remember to Squash all the commits into
one and provide a bullet point description of the highlights for that branch.

## Pipeline steps

The project uses a CI/CD workflow.

The CI flow is triggered when a PR is opened against the release branch:

- Build -> Deploy to Dev -> Unit Tests -> ZAP -> Acceptance -> End

The CD flow is triggered when a PR is opened against the master branch:

- Build -> Deploy to Dev -> Unit Tests -> ZAP -> Deploy to TEST -> Functional Tests -> Deploy to PROD -> Acceptance -> End

User input is required for the Acceptance and Deploy to PROD steps.
