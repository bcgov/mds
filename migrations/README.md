## SQL scripts for ETL and Migrations

This folder contains following:

```
|-- Dockerfile (Dockerfile definition for OpenShift build)
|-- Dockerfile.dev (Dockerfile definition for local development)
|-- sql\ (Directory containing SQL scripts for migrations to be run by Flyway)
```

The project uses Flyway to version and run the Database migrations. The docker image also contains Postgres-client (psql)
which can be used to run any scripts directly against the database.

### Migrations

The migrations scripts are versioned as per flyway recommended convention. For more info:
https://flywaydb.org/documentation/migrations
