#!/bin/sh

# Change directory to Flyway home
cd $FLYWAY_HOME

# Substitute environment variables in template files
export DOLAR='$'
if ls $FLYWAY_HOME/sql/*.tmpl > /dev/null 2>&1 ; then
echo "---> substituting environment variables in templates"
for file in $FLYWAY_HOME/sql/*.tmpl; do
    target_file="$FLYWAY_HOME/sql/$(basename "$file" .tmpl)"
    envsubst < "$file" > "$target_file"
done
fi

# Run migrations for mds database
./flyway migrate

# Run migrations for mds_test database
./flyway -url=jdbc:postgresql://$FLYWAY_DB_HOST/mds_test migrate