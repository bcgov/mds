## Flyway Migrations

This folder contains following:

```
|-- Dockerfile.flyway.dev (Dockerfile definition for local development)
|-- Dockerfile.flyway.ci (Openshift Build)
|-- sql\ (Directory containing SQL scripts for migrations to be run by Flyway)
```

The project uses Flyway to version and run the Database migrations. The docker image also contains Postgres-client (psql)
which can be used to run any scripts directly against the database.

### Migrations

The migrations scripts are versioned as per flyway recommended convention. For more info:
https://flywaydb.org/documentation/migrations

### Troubleshooting

1. Migration history is stored in the `flyway_schema_history` table in the `mds` and `test` databases: if a migration has failed to run or they occured in the wrong order (such as when switching branches), remove the most recent entries from these tables before re-running the migrations.
2. To re-run the migrations, simply start the flyway docker container.
3. If the migration has run successfully but the data has not changed as expected, check for conflicting data in sql scripts with the prefix `afterMigrate` and adjust accordingly.
