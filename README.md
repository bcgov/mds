# Mines Digital Services

The technologies that support mine oversight for British Columbians need to be reimagined. This project will replace the legacy Mine Management System (MMS) with a scalable, open source, data driven system using modern and flexible technologies.

The Mines Digital Services (MDS) will have a number of interconnections and relationships to systems across the Natural Resource Ministries and will be important not only to the Ministry of Energy, Mines and Low Carbon Innovation but also to inter-agency collaborations across ministries. The future state must be intuitive, and capable of providing meaningful data to relevant stakeholders.

[![Lifecycle:Maturing](https://img.shields.io/badge/Lifecycle-Maturing-007EC6)](Redirect-URL)
[![CORE WEB - Unit Tests](https://github.com/bcgov/mds/actions/workflows/core-web.unit.yaml/badge.svg)](https://github.com/bcgov/mds/actions/workflows/core-web.unit.yaml)
[![CORE API - Integration Tests](https://github.com/bcgov/mds/actions/workflows/tests.integration.yaml/badge.svg)](https://github.com/bcgov/mds/actions/workflows/tests.integration.yaml)
[![MINESPACE - Unit Tests](https://github.com/bcgov/mds/actions/workflows/minespace.unit.yaml/badge.svg)](https://github.com/bcgov/mds/actions/workflows/minespace.unit.yaml)

[![Maintainability](https://api.codeclimate.com/v1/badges/383b986cb973e1d0187f/maintainability)](https://codeclimate.com/github/bcgov/mds/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/383b986cb973e1d0187f/test_coverage)](https://codeclimate.com/github/bcgov/mds/test_coverage)

## Features

The product is anticipated to include:

1. Support for integrated analysis and decision making across the process of mine oversight
2. Support for the creation of a complex data model that can connect various components of mines. Some examples include consultation information, risk management modeling, spatial data, financial tracking and collecting and physical attributes
3. Enhancements to the public-facing [BC Mine Information website](http://mines.nrs.gov.bc.ca/) ([github repository](https://github.com/bcgov/mem-mmti-public)) to broaden the available data and create new or improved functionality to increase usability
4. Enhancements to the [BC Mine Information website's administrative console](https://mines.empr.gov.bc.ca/) ([github repository](https://github.com/bcgov/mem-admin)) , including work required to connect with other systems (e.g., the Natural Resource Inspection System, aka NRIS)

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

This project support verifiable credential features compatible with [AnonCreds](https://www.hyperledger.org/projects/anoncreds) and [Hyperledger Aries](https://www.hyperledger.org/projects/aries) and serves as the [Administering Authority for the BC Mines Act Permit](https://github.com/bcgov/bc-vcpedia/blob/main/credentials/credential-bc-mines-act-permit.md#15-administering-authority).

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
