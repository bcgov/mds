# Mines Digital Services

Mines Digital Services (MDS) upholds the BC Public Service’s commitment to modernization, transparency, and efficiency, enabling better governance and service delivery when it comes to mining in British Columbia.

This project replaced the legacy Mine Management System (MMS) with a scalable, open source, data driven system using modern and flexible technologies.

The MDS have a number of interconnections and relationships to systems across the Natural Resource Ministries and is important not only to the Ministry of Mining and Critical Minerals but also to inter-agency collaborations across ministries, industry stakeholders and the public.

[![Lifecycle:Maturing](https://img.shields.io/badge/Lifecycle-Maturing-007EC6)](Redirect-URL)
[![CORE WEB - Unit Tests](https://github.com/bcgov/mds/actions/workflows/core-web.unit.yaml/badge.svg)](https://github.com/bcgov/mds/actions/workflows/core-web.unit.yaml)
[![CORE API - Integration Tests](https://github.com/bcgov/mds/actions/workflows/tests.integration.yaml/badge.svg)](https://github.com/bcgov/mds/actions/workflows/tests.integration.yaml)
[![MINESPACE - Unit Tests](https://github.com/bcgov/mds/actions/workflows/minespace.unit.yaml/badge.svg)](https://github.com/bcgov/mds/actions/workflows/minespace.unit.yaml)

[![Maintainability](https://api.codeclimate.com/v1/badges/383b986cb973e1d0187f/maintainability)](https://codeclimate.com/github/bcgov/mds/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/383b986cb973e1d0187f/test_coverage)](https://codeclimate.com/github/bcgov/mds/test_coverage)

## Features

Key products that are maintained by MDS include Core, MineSpace and the public-facing [BC Mine Information website](https://mines.nrs.gov.bc.ca) [(github repository)](https://github.com/bcgov/NR-BCMI)

Mines Digital Services build features with these principles in mind:

1. MDS develops tools and platforms that prioritize ease of use for mining companies, regulators, and the public.
2. MDS supports access to high-quality geoscientific data and regulatory information, empowering government bodies and mining companies to make informed decisions.
3. MDS collaborates across government agencies and industries to create cohesive solutions that integrate regulatory processes, permitting, and compliance systems.
4. Digital tools from MDS help monitor and ensure mining activities adhere to environmental and social governance standards.

## Services

- [Common](services/common/README.md) (Frontend Shared Code)
- [Core Web](services/core-web/README.md) (Ministry Frontend)
- [Minespace Web](services/minespace-web/README.md) (Proponent Frontend)
- [Core API](services/core-api/README.md) (Shared Backend)
  - [Core API JWT](services/core-api/app/flask_jwt_oidc_local/README.md) (SSO)
  - Celery (Scheduled CRON jobs)
- [Database](services/database/README.md)
  - [Flyway](migrations/README.md) (Database Migrations)
- [Document Manager](services/document-manager/backend/README.md)
  - [Document Manager Migrations](services/document-manager/backend/migrations/README.md)
- [Fider](services/fider/README.md)
- [Filesystem Provider](services/filesystem-provider/ej2-amazon-s3-aspcore-file-provider/README.md)
- [NRIS](services/nris-api/backend/README.md)
- [Permits](services/permits/README.md)

## Operations

- [Azure](operations/azure/README.md)
  - [Azure Setup](operations/azure/setup/README.md)

## Tests

- [Testing Strategy](docs/testing/test_strategy.md)
- [Functional Tests](tests/functional-tests/README.md)
- [Load Testing](tests/load-testing/README.md)

---

## Typescript

This application was originally developed in Javascript, and is being migrated to Typescript. The following documentation is available to assist with the migration:

- [Typescript](docs/processes/typescript.md)

---

## Verifiable Credentials

This project support verifiable credential features compatible with [AnonCreds](https://www.hyperledger.org/projects/anoncreds) and [Hyperledger Aries](https://www.hyperledger.org/projects/aries) and serves as the [Administering Authority for the BC Mines Act Permit](https://github.com/bcgov/bc-vcpedia/blob/main/credentials/bc-mines-act-permit/1.1.1/governance.md#15-administering-authority).

See the [Verifiable Credential doc](docs/verifiable_credentials.md) for more detail.

## How to Contribute

Please read the [How to Contribute guide](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Develop

Please read the [How to develop](USAGE.md) for project setup instructions and [Getting Started](docs/devops/getting_started.md) for DevOps information.

### OpenShift Deployment

[OpenShift Debugging Guide](docs/openshift/debugging_guide.md)
[OpenShift Caveats](docs/openshift/Openshift%20Caveats.md)
[Terraform](terraform/README.md)
[OpenShift Database](docs/openshift/database.md)
[OpenShift PG upgrade](docs/openshift/PG_9_to_13_upgrade.md)

## License

Code released under the [Apache License, Version 2.0](LICENSE.md).
