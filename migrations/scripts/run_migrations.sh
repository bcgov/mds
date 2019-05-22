#!/bin/sh

# Change directory to Flyway home
cd $FLYWAY_HOME

# Run migrations for mds database
./flyway migrate

# Run migrations for mds_test database
./flyway -url=jdbc:postgresql://$FLYWAY_DB_HOST/mds_test migrate