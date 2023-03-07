## DevOps How To

MDS Project runs on [Redhat Open Shift 4](https://www.redhat.com/en/technologies/cloud-computing/openshift), hereafter referred to as OCP.

The BC Gov Platform Services Team hosts the OCP container and manages the operations, maintains uptime. The cluster health can be monitored [here](https://status.developer.gov.bc.ca/)

More details on platform services, updates on activities on the cluster and disucssions on topics can be done via [Rocket chat](https://chat.developer.gov.bc.ca/home)

#### Tools Used:

- Deployment Platform - OCP
- Build Tool - Github Actions
- Image Registry - OCP Image Streams
- GitOps - Argo CD
- Scripting - BASH

#### Things to get access to:

- IDIR User - Contact your PO
- [OCP](https://console.apps.silver.devops.gov.bc.ca/k8s/cluster/projects) `Admin` Access - Existing admins can make you an admin.
- [This form](https://just-ask.developer.gov.bc.ca/) gets you added to the `bcgov` and `bcgov-c` orgs.
- [Github repo](https://github.com/bcgov/mds) - Get added to the as a maintainer
- [ArgoCD](https://argocd-shared.apps.silver.devops.gov.bc.ca/) - Get added to the GitOpsStream with the role `admin`
- [Rocket Chat](https://chat.developer.gov.bc.ca/home) - To keep abreast Platform Services Updates

#### Local Setup:

MDS project should be run on a LINUX or UNIX based system, there are several options such as

- Mac OS
- Any Linux Distribution (Team members have used Ubuntu, Mint, Arch Linux in the past)
- Windows WSL

You would need to have atleast the following installed:

- Git
- Docker
- Docker Compose
- Make
- Open Shift CLI
- Essential Cli utilites (awk, sed, coreutils, etc)

#### Things to know:

- We have three services that the team actively works on, that is `core-api`, `core-web` and `minespace`
- These three services are configured to be deployed via gitops using Argo CD
  - Each new push to the develop branch, does a build+push of the image and updates the Git SHA of in the env vars of deployment, which triggers a new deploy through git ops
- All kubernetes artifacts are managed through gitops

#### How we work:

> Planning the sprint:

- DevOps Refinement is used to scope out tasks in the backlog and estimate them, fine tune details.
- Tickets are pulled in as part of the regular sprint planning meetings

> Other general guidelines

- Communicate devops changes constantly on #general to keep everyone informed
- Principle of least to no disruption on changes for dev team
- Multi staged rollouts for changes instead of lift and shift
- Constant reevaluation of state of things

#### Key metrics:

We want to track DORA Metrics:

Deployment frequency (DF)
Lead time for changes (LT)
Mean time to recovery (MTTR)
Change failure rate (CFR)

#### Other details

The devops backlog is [here](https://bcmines.atlassian.net/jira/software/c/projects/MDS/boards/34/backlog?view=detail&selectedIssue=MDS-4298&epics=visible&issueLimit=100&selectedEpic=MDS-4241)

Any new tasks should be listed under [this epic](https://bcmines.atlassian.net/browse/MDS-4241) with details and prioritized
