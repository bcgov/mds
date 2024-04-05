#!/bin/bash
set -euxo pipefail

# Change directory to Flyway home
cd $FLYWAY_HOME

# Substitute environment variables in template files
if ls $FLYWAY_HOME/sql/*.tmpl >/dev/null 2>&1; then
    echo "---> substituting environment variables in templates"
    for file in $FLYWAY_HOME/sql/*.tmpl; do
        target_file="$FLYWAY_HOME/sql/$(basename "$file" .tmpl)"
        envsubst <"$file" >"$target_file"
    done
fi

# Make flyway binary discoverable
export PATH="$FLYWAY_HOME:$PATH"

ENVIRONMENT_NAME="${ENVIRONMENT_NAME:-dev}"

# Run migrations for mds database
if [[ $ENVIRONMENT_NAME == 'prod' ]]; then
    echo "---> Running prod migrations"
    flyway -locations=filesystem:sql,filesystem:sql-prod -validateMigrationNaming=true migrate
else
    echo "---> Running common migrations"
    flyway -locations=filesystem:sql -validateMigrationNaming=true migrate
fi

# Run migrations for mds_test database
if [ "$PLATFORM" != "K8S" ]; then
    flyway -url=jdbc:postgresql://$FLYWAY_DB_HOST/mds_test migrate
fi
